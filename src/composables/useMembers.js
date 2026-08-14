import { ref, computed } from 'vue'
import { crudAction } from '../api'

// 模块级共享，所有组件加载一次即可
const members = ref([])
const loaded = ref(false)
let loadPromise = null

export function useMembers() {
    async function loadMembers({ force = false } = {}) {
        if (loaded.value && !force) return members.value
        if (loadPromise) return loadPromise

        loadPromise = crudAction('member', 'get_all', { pageIndex: 1, pageSize: 1000 })
            .then(res => {
                members.value = res?.list || []
                loaded.value = true
                return members.value
            })
            .finally(() => {
                loadPromise = null
            })

        return loadPromise
    }

    const memberMap = computed(() => {
        const map = {}
        for (const m of members.value) map[m.id] = m
        return map
    })

    return { members, loadMembers, memberMap }
}
