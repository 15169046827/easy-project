import { createRouter, createWebHashHistory } from 'vue-router'

export const routes = [
    { path: '/', redirect: '/dashboard' },
    {
        path: '/dashboard',
        name: 'Dashboard',
        component: () => import('../modules/dashboard/components/DashboardView.vue')
    },
    {
        path: '/projects',
        name: 'Projects',
        component: () => import('../modules/task/components/ProjectList/ProjectList.vue')
    },
    {
        path: '/project/:id',
        name: 'Project',
        component: () => import('../modules/project/components/ProjectWorkspace.vue'),
        props: route => ({ projectId: route.params.id })
    },
    {
        path: '/tasks',
        name: 'Tasks',
        component: () => import('../modules/task/components/TaskList/TaskList.vue'),
        props: route => ({ initialProjectId: route.query.project || '' })
    },
    {
        path: '/members',
        name: 'Members',
        component: () => import('../modules/member/components/MemberList.vue')
    },
    {
        path: '/data',
        name: 'Data',
        component: () => import('../modules/data/components/DataView.vue')
    },
    { path: '/:pathMatch(.*)*', redirect: '/dashboard' }
]

export function createAppRouter(history = createWebHashHistory()) {
    return createRouter({
        history,
        routes,
        scrollBehavior() {
            return { top: 0 }
        }
    })
}

export default createAppRouter()
