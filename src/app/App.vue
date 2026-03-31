<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { storeToRefs } from 'pinia';

import Footer from '@/shared/layout/AppFooter.vue';
import Sidebar from '@/shared/layout/AppSidebar.vue';
import { useDataCounts } from '@/shared/lib/hooks/useDataCounts';
import { APP_TABS, type AppTab } from '@/shared/lib/utils/navigation';
import Toast from '@/shared/ui/Toast.vue';
import Dashboard from '@/views/DashboardLayout.vue';
import Login from '@/views/LoginView.vue';

import { useLayoutStore } from '@/stores/useLayoutStore';
import { useUIStore } from '@/stores/useNotificationStore';
import { useSessionStore } from '@/stores/useSessionStore';
import { useThemeStore } from '@/stores/useThemeStore';

const SettingsModal = defineAsyncComponent(() =>
    import('@/widgets/settings').then((module) => module.SettingsModal)
);
const HelpModal = defineAsyncComponent(() =>
    import('@/widgets/settings').then((module) => module.HelpModal)
);

const sessionStore = useSessionStore();
const themeStore = useThemeStore();
const layoutStore = useLayoutStore();
const uiStore = useUIStore();
const route = useRoute();
const router = useRouter();

const { sessionState, initialData } = storeToRefs(sessionStore);
const { checkSession, initializeSystem, login, logout } = sessionStore;

const { subscriptionsCount, profilesCount, manualNodesCount } = useDataCounts(initialData);

const activeTab = computed({
    get: () => (route.name as AppTab) || 'dashboard',
    set: (val: AppTab) => {
        router.push({ name: val });
    }
});

const showHelpModal = ref(false);

const isLoggedIn = computed(() => sessionState.value === 'loggedIn');
const isLoadingSession = computed(() => sessionState.value === 'loading');
const isNeedsSetup = computed(() => sessionState.value === 'needsSetup');
const currentTabInfo = computed(() => APP_TABS[activeTab.value] || APP_TABS.dashboard);

const openSettings = () => {
    uiStore.show();
};

const openHelp = () => {
    showHelpModal.value = true;
};

onMounted(() => {
    themeStore.initTheme();
    layoutStore.init();
    checkSession();
});
</script>

<template>
    <div class="app-container">
        <div v-if="!isLoggedIn" class="login-page">
            <div v-if="isLoadingSession" class="loading-container">
                <div class="loading-spinner-wrapper">
                    <div class="loading-spinner-outer"></div>
                    <div class="loading-spinner-inner"></div>
                </div>
                <p class="loading-text">正在加载...</p>
            </div>

            <div v-else-if="isNeedsSetup" class="login-form-container">
                <Login :login="initializeSystem" :is-setup="true" />
            </div>

            <div v-else class="login-form-container">
                <Login :login="login" />
            </div>
        </div>

        <div v-else class="dashboard-container">
            <Sidebar
                v-model="activeTab"
                :subscriptions-count="subscriptionsCount"
                :profiles-count="profilesCount"
                :manual-nodes-count="manualNodesCount"
                @logout="logout"
                @settings="openSettings"
                @help="openHelp"
            />

            <main
                class="main-content"
                :class="{ 'main-content-full': layoutStore.sidebarCollapsed }"
            >
                <div class="content-wrapper">
                    <header class="page-header">
                        <div class="header-content">
                            <div class="header-text">
                                <h1 class="page-title">{{ currentTabInfo.title }}</h1>
                                <p class="page-description">{{ currentTabInfo.description }}</p>
                            </div>
                        </div>
                    </header>

                    <div class="dashboard-content">
                        <Dashboard :data="initialData" />
                    </div>

                    <Footer class="dashboard-footer" />
                </div>
            </main>
        </div>

        <Toast />
        <SettingsModal v-model:show="uiStore.isSettingsModalVisible" />
        <HelpModal v-if="showHelpModal" v-model:show="showHelpModal" />
    </div>
</template>
