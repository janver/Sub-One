import { KV_KEY_SETTINGS, KV_KEY_SUBS } from '../config/constants';
import { GLOBAL_USER_AGENT, defaultSettings } from '../config/defaults';
import { parse } from '../proxy';
import { AppConfig, Subscription, SubscriptionUserInfo } from '../proxy/types';
import { checkAndNotify, sendTgNotification } from '../services/notification';
import { StorageFactory } from '../services/storage';
import { getStorageBackendInfo } from '../services/storage-backend';
import { Env } from '../types';

// const subscriptionParser = new SubscriptionParser();

/**
 * 获取当前活动的存储服务实例
 */
async function getStorage(env: Env) {
    const info = await getStorageBackendInfo(env);
    return StorageFactory.create(env, info.current);
}

export async function handleCronTrigger(env: Env): Promise<Response> {
    console.log('Cron trigger fired. Checking all subscriptions for traffic and node count...');

    const storage = await getStorage(env);
    const initialSubs = (await storage.get<Subscription[]>(KV_KEY_SUBS)) || [];
    const settings = (await storage.get<AppConfig>(KV_KEY_SETTINGS)) || defaultSettings;

    // 存储更新结果: Map<subId, {userInfo, nodeCount}>
    const updates = new Map<string, { userInfo?: SubscriptionUserInfo; nodeCount?: number }>();

    // 并行执行所有请求以减少总耗时
    const updatePromises = initialSubs.map(async (sub) => {
        if (!sub.url.startsWith('http') || !sub.enabled) return;

        try {
            const singleRequest = fetch(
                new Request(sub.url, {
                    headers: { 'User-Agent': GLOBAL_USER_AGENT },
                    redirect: 'follow',
                    cf: { insecureSkipVerify: true }
                } as RequestInit)
            );

            const response = (await Promise.race([
                singleRequest,
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 30000))
            ])) as Response;

            if (response.ok) {
                const updateData: { userInfo?: SubscriptionUserInfo; nodeCount?: number } = {};
                let hasUpdate = false;

                // 1. 提取流量信息（从headers）
                const userInfoHeader = response.headers.get('subscription-userinfo');
                if (userInfoHeader) {
                    const info: Partial<SubscriptionUserInfo> = {};
                    userInfoHeader.split(';').forEach((part) => {
                        const [key, value] = part.trim().split('=');
                        if (key && value) {
                            const numValue = Number(value);
                            if (!isNaN(numValue)) {
                                (info as Record<string, number>)[key] = numValue;
                            }
                        }
                    });

                    // 临时更新本地副本用于检查通知（不影响最终写入）
                    sub.userInfo = info as SubscriptionUserInfo;
                    updateData.userInfo = info as SubscriptionUserInfo;

                    // 检查到期和流量预警
                    await checkAndNotify(sub, settings as AppConfig);
                    hasUpdate = true;
                }

                // 2. 提取节点数量（从body）
                const text = await response.text();
                try {
                    // 只解析不处理去重，只为了计数
                    const nodes = parse(text);
                    if (nodes.length > 0) {
                        updateData.nodeCount = nodes.length;
                        hasUpdate = true;
                    }
                } catch (e) {
                    console.error(`Cron: Parse failed for ${sub.name}:`, e);
                }

                if (hasUpdate) {
                    updates.set(sub.id, updateData);
                }
            }
        } catch (e) {
            console.error(`Cron: Failed to process ${sub.name}:`, e);
        }
    });

    await Promise.allSettled(updatePromises);

    if (updates.size > 0) {
        // 关键修复：再次获取最新数据，应用更新，防止覆盖用户期间的修改
        const latestSubs = (await storage.get<Subscription[]>(KV_KEY_SUBS)) || [];
        let hasChanges = false;

        for (const sub of latestSubs) {
            if (updates.has(sub.id)) {
                const update = updates.get(sub.id)!;
                if (update.userInfo) {
                    sub.userInfo = update.userInfo;
                    hasChanges = true;
                }
                if (update.nodeCount !== undefined) {
                    sub.nodeCount = update.nodeCount;
                    hasChanges = true;
                }
            }
        }

        if (hasChanges) {
            await storage.put(KV_KEY_SUBS, latestSubs);
            console.log(`Updated ${updates.size} subscriptions with new info.`);

            // 发送自动更新结果汇总到 TG
            const summaryMsg = `🔄 *定时更新报告*\n\n✅ 成功刷新了 \`${updates.size}\` 个订阅的数据。`;
            await sendTgNotification(settings as AppConfig, summaryMsg);
        }
    } else {
        console.log('Cron job finished. No changes detected.');
    }

    return new Response('Cron job completed successfully.', { status: 200 });
}
