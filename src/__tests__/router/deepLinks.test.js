import { createMemoryHistory } from 'vue-router'
import { describe, expect, it } from 'vitest'
import { createAppRouter } from '../../router'

describe('application deep links', () => {
    it('resolves a project detail URL and maps its id prop', () => {
        const router = createAppRouter(createMemoryHistory())
        const route = router.resolve('/project/project-42')
        const props = route.matched.at(-1).props.default(route)

        expect(route.name).toBe('Project')
        expect(props).toEqual({ projectId: 'project-42' })
    })

    it('keeps the optional project context on the all-tasks URL', () => {
        const router = createAppRouter(createMemoryHistory())
        const route = router.resolve('/tasks?project=project-42')
        const props = route.matched.at(-1).props.default(route)

        expect(route.name).toBe('Tasks')
        expect(props).toEqual({ initialProjectId: 'project-42' })
    })

    it('leaves the all-tasks URL unfiltered when no project is supplied', () => {
        const router = createAppRouter(createMemoryHistory())
        const route = router.resolve('/tasks')
        const props = route.matched.at(-1).props.default(route)

        expect(props).toEqual({ initialProjectId: '' })
    })

    it('registers a dashboard fallback for unknown paths', () => {
        const router = createAppRouter(createMemoryHistory())
        const match = router.resolve('/does-not-exist').matched.at(-1)

        expect(match.redirect).toBe('/dashboard')
    })
})
