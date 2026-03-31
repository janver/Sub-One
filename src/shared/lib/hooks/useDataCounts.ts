import { type Ref, computed } from 'vue';

import { storeToRefs } from 'pinia';

import type { InitialData } from '@/shared/lib/types/index';
import { HTTP_REGEX } from '@/shared/lib/utils/constants';

import { useDataStore } from '@/stores/useAppStore';

export function useDataCounts(initialData: Ref<InitialData | null>) {
    const dataStore = useDataStore();
    const { isInitialized, manualNodes, profiles, subscriptions } = storeToRefs(dataStore);

    const subscriptionsCount = computed(() => {
        if (isInitialized.value) {
            return subscriptions.value.length;
        }

        return (
            initialData.value?.subs?.filter((item) => item.url && HTTP_REGEX.test(item.url))
                .length ?? 0
        );
    });

    const profilesCount = computed(() => {
        if (isInitialized.value) {
            return profiles.value.length;
        }

        return initialData.value?.profiles?.length ?? 0;
    });

    const manualNodesCount = computed(() => {
        if (isInitialized.value) {
            return manualNodes.value.length;
        }

        return (
            initialData.value?.subs?.filter((item) => !item.url || !HTTP_REGEX.test(item.url))
                .length ?? 0
        );
    });

    return {
        subscriptionsCount,
        profilesCount,
        manualNodesCount
    };
}
