import { ref } from 'vue';

import { defineStore } from 'pinia';

/**
 * Toast 提示类型
 */
type ToastType = 'info' | 'success' | 'error' | 'warning';

/**
 * Toast 提示接口定义
 */
interface Toast {
    /** Toast 唯一标识符 */
    id: string;
    /** 提示消息内容 */
    message: string;
    /** 提示类型 */
    type: ToastType;
}

/**
 * 通知管理 Store (合并了原 UI Store 和 Toast Store)
 */
export const useNotificationStore = defineStore('notification', () => {
    // ==================== UI 状态 ====================

    /** 设置模态框可见性 */
    const isSettingsModalVisible = ref(false);

    /** 显示设置模态框 */
    function showSettings() {
        isSettingsModalVisible.value = true;
    }

    /** 隐藏设置模态框 */
    function hideSettings() {
        isSettingsModalVisible.value = false;
    }

    // ==================== Toast 状态 ====================

    /** Toast 提示列表 */
    const toasts = ref<Toast[]>([]);

    /**
     * 显示 Toast 提示
     */
    function showToast(message: string, type: ToastType = 'info', duration = 3000) {
        const id = Date.now() + Math.random().toString(36).substr(2, 9);
        const toast: Toast = { id, message, type };
        toasts.value.push(toast);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        if (toasts.value.length > 5) {
            toasts.value.shift();
        }
    }

    /**
     * 移除指定的 Toast 提示
     */
    function removeToast(id: string) {
        const index = toasts.value.findIndex((t) => t.id === id);
        if (index !== -1) {
            toasts.value.splice(index, 1);
        }
    }

    return {
        // UI
        isSettingsModalVisible,
        showSettings,
        hideSettings,
        show: showSettings, // Alias for backward compatibility
        hide: hideSettings, // Alias for backward compatibility

        // Toast
        toasts,
        showToast,
        removeToast
    };
});

// 为了兼容旧代码，导出原来的 Store 名称
export const useUIStore = useNotificationStore;
export const useToastStore = useNotificationStore;
