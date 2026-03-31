<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
    defineProps<{
        visible: boolean;
        selectedCount: number;
        accent?: 'indigo' | 'purple' | 'emerald';
        deleteLabel?: string;
    }>(),
    {
        accent: 'indigo',
        deleteLabel: '删除选中'
    }
);

const emit = defineEmits<{
    (e: 'select-all'): void;
    (e: 'invert-selection'): void;
    (e: 'deselect-all'): void;
    (e: 'delete-selected'): void;
    (e: 'cancel'): void;
}>();

const styleMap = {
    indigo: {
        wrapper:
            'border-indigo-200 from-indigo-50 to-purple-50 dark:border-indigo-800 dark:from-indigo-900/20 dark:to-purple-900/20',
        text: 'text-indigo-700 dark:text-indigo-300',
        badge: 'bg-indigo-600'
    },
    purple: {
        wrapper:
            'border-purple-200 from-purple-50 to-pink-50 dark:border-purple-800 dark:from-purple-900/20 dark:to-pink-900/20',
        text: 'text-purple-700 dark:text-purple-300',
        badge: 'bg-purple-600'
    },
    emerald: {
        wrapper:
            'border-emerald-200 from-emerald-50 to-green-50 dark:border-emerald-800 dark:from-emerald-900/20 dark:to-green-900/20',
        text: 'text-emerald-700 dark:text-emerald-300',
        badge: 'bg-emerald-600'
    }
} as const;

const accentStyles = computed(() => styleMap[props.accent]);
</script>

<template>
    <Transition name="slide-fade">
        <div
            v-if="visible"
            class="mb-6 rounded-2xl border-2 bg-linear-to-r p-4 shadow-lg"
            :class="accentStyles.wrapper"
        >
            <div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
                <div
                    class="flex items-center gap-2 text-sm font-semibold"
                    :class="accentStyles.text"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                    >
                        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                        <path
                            fill-rule="evenodd"
                            d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                            clip-rule="evenodd"
                        />
                    </svg>
                    批量删除模式
                    <span
                        v-if="selectedCount > 0"
                        class="ml-2 rounded-full px-3 py-1 text-xs font-bold text-white shadow-md"
                        :class="accentStyles.badge"
                    >
                        已选 {{ selectedCount }}
                    </span>
                </div>

                <div class="flex flex-wrap items-center gap-2">
                    <button
                        class="btn-modern-enhanced btn-secondary transform px-3 py-1.5 text-xs font-semibold transition-all duration-300 hover:scale-105 sm:px-4 sm:py-2 sm:text-sm"
                        @click="emit('select-all')"
                    >
                        全选
                    </button>
                    <button
                        class="btn-modern-enhanced btn-secondary transform px-3 py-1.5 text-xs font-semibold transition-all duration-300 hover:scale-105 sm:px-4 sm:py-2 sm:text-sm"
                        @click="emit('invert-selection')"
                    >
                        反选
                    </button>
                    <button
                        class="btn-modern-enhanced btn-secondary transform px-3 py-1.5 text-xs font-semibold transition-all duration-300 hover:scale-105 sm:px-4 sm:py-2 sm:text-sm"
                        @click="emit('deselect-all')"
                    >
                        清空选择
                    </button>
                    <button
                        :disabled="selectedCount === 0"
                        class="btn-modern-enhanced btn-danger flex transform items-center gap-1 px-3 py-1.5 text-xs font-semibold transition-all duration-300 hover:scale-105 disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:py-2 sm:text-sm"
                        @click="emit('delete-selected')"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            class="h-4 w-4"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fill-rule="evenodd"
                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                clip-rule="evenodd"
                            />
                        </svg>
                        {{ deleteLabel }} ({{ selectedCount }})
                    </button>
                    <button
                        class="btn-modern-enhanced btn-cancel transform px-3 py-1.5 text-xs font-semibold transition-all duration-300 hover:scale-105 sm:px-4 sm:py-2 sm:text-sm"
                        @click="emit('cancel')"
                    >
                        取消
                    </button>
                </div>
            </div>
        </div>
    </Transition>
</template>
