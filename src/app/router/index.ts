import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            redirect: '/dashboard'
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: () => import('../features/dashboard/views/DashboardHomeView.vue')
        },
        {
            path: '/subscriptions',
            name: 'subscriptions',
            component: () => import('../features/subscriptions/views/SubscriptionsTabView.vue')
        },
        {
            path: '/profiles',
            name: 'profiles',
            component: () => import('../features/profiles/views/ProfilesTabView.vue')
        },
        {
            path: '/nodes',
            name: 'nodes',
            component: () => import('../features/nodes/views/NodesTabView.vue')
        }
    ]
});

export default router;
