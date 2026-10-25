import { crudAction } from './index.js'

/** Load a complete flat scope; never mistake a root count for a task count. */
export async function loadAllTasks(query = {}) {
    const list = []
    const seen = new Set()
    let total
    let pageIndex = 1
    do {
        const result = await crudAction('task', 'get_all', {
            ...query,
            hierarchy: false,
            pageIndex,
            pageSize: 1000
        })
        const page = result?.list || []
        const nextTotal = result?.total ?? page.length
        if (
            !Number.isSafeInteger(nextTotal) ||
            nextTotal < 0 ||
            (total !== undefined && nextTotal !== total)
        )
            throw new Error('Task catalog changed; refresh before continuing')
        total = nextTotal
        for (const task of page) {
            if (seen.has(task.id))
                throw new Error('Duplicate task across catalog pages; refresh before continuing')
            seen.add(task.id)
            list.push(task)
        }
        if (!page.length && list.length < total) throw new Error('Incomplete task catalog')
        pageIndex++
    } while (list.length < total)
    return list
}
