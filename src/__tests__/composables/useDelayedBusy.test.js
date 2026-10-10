import { effectScope, nextTick, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useDelayedBusy } from '../../composables/useDelayedBusy.js'

describe('delayed loading indicators', () => {
    afterEach(() => vi.useRealTimers())
    it('does not flash during fast requests but shows genuinely slow ones', async () => {
        vi.useFakeTimers()
        const busy = ref(false)
        const scope = effectScope()
        const visible = scope.run(() => useDelayedBusy(busy))
        busy.value = true
        await nextTick()
        vi.advanceTimersByTime(100)
        busy.value = false
        await nextTick()
        vi.advanceTimersByTime(200)
        expect(visible.value).toBe(false)
        busy.value = true
        await nextTick()
        vi.advanceTimersByTime(200)
        expect(visible.value).toBe(true)
        busy.value = false
        await nextTick()
        expect(visible.value).toBe(false)
        scope.stop()
    })
    it('cleans up pending indicators when the view is closed', () => {
        vi.useFakeTimers()
        const scope = effectScope()
        const visible = scope.run(() => useDelayedBusy(ref(true)))
        scope.stop()
        vi.advanceTimersByTime(500)
        expect(visible.value).toBe(false)
    })
})
