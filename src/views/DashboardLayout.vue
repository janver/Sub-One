<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import type { InitialData, Profile, Subscription } from '@/shared/lib/types/index';
import { NodeDetailsModal } from '@/widgets/node';

import { useDataStore } from '@/stores/useAppStore';

const props = withDefaults(
    defineProps<{
        data?: InitialData | null;
    }>(),
    {
        data: null
    }
);

const dataStore = useDataStore();
const router = useRouter();
const route = useRoute();

const isLoading = ref(true);
const showNodeDetailsModal = ref(false);
const selectedSubscription = ref<Subscription | null>(null);
const selectedProfile = ref<Profile | null>(null);
const tabAction = ref<{ action: string; payload?: unknown } | null>(null);

const handleShowNodes = (payload: Subscription | Profile) => {
    // If payload has 'url', it's a Subscription (technically profiles don't have urls in our types)
    if ('url' in payload || 'nodeCount' in payload) {
        selectedSubscription.value = payload as Subscription;
        selectedProfile.value = null;
    } else {
        selectedProfile.value = payload as Profile;
        selectedSubscription.value = null;
    }
    showNodeDetailsModal.value = true;
};

watch(
    () => props.data,
    (data) => {
        if (data) {
            dataStore.initData(data);
        }
        isLoading.value = false;
    },
    { immediate: true }
);
</script>

<template>
    <div v-if="isLoading" class="py-16 text-center text-gray-500">正在加载...</div>

    <div v-else class="container-optimized w-full">
        <router-view v-slot="{ Component }">
            <Transition name="page-fade" mode="out-in">
                <div :key="route.name as string" class="space-y-6 lg:space-y-8">
                    <component
                        :is="Component"
                        :tab-action="tabAction"
                        @action-handled="tabAction = null"
                        @show-nodes="handleShowNodes"
                        @add-subscription="router.push('/subscriptions')"
                        @add-node="router.push('/nodes')"
                        @add-profile="router.push('/profiles')"
                    />
                </div>
            </Transition>
        </router-view>
    </div>

    <NodeDetailsModal
        :show="showNodeDetailsModal"
        :subscription="selectedSubscription"
        :profile="selectedProfile"
        @update:show="showNodeDetailsModal = $event"
    />
</template>

<style scoped>
.cursor-move {
    cursor: move;
}

.page-fade-enter-active,
.page-fade-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-fade-enter-from {
    opacity: 0;
    transform: translateX(10px);
}

.page-fade-leave-to {
    opacity: 0;
    transform: translateX(-10px);
}

@media (max-width: 1024px) {
    .container-optimized {
        width: 100% !important;
    }
}

@media (max-width: 640px) {
    .btn-modern-enhanced {
        font-size: 0.8125rem !important;
        padding: 0.5rem 0.75rem !important;
    }

    .flex.flex-wrap.items-center.gap-3 {
        gap: 0.5rem !important;
    }
}
</style>
