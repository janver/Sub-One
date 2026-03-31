export const APP_TABS = {
    dashboard: {
        title: '仪表盘',
        description: '概览您的订阅和节点状态'
    },
    subscriptions: {
        title: '订阅管理',
        description: '管理您的所有机场订阅链接'
    },
    profiles: {
        title: '订阅组',
        description: '创建和管理订阅组合'
    },
    nodes: {
        title: '手动节点',
        description: '添加和管理单个节点链接'
    }
} as const;

export type AppTab = keyof typeof APP_TABS;
