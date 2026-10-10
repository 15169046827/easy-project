import { onScopeDispose, ref, watch } from 'vue'

/** Keep quick refreshes from flashing an overlay; retain truthful busy state separately. */
export function useDelayedBusy(busy, delay = 200) {
    const visible = ref(false)
    let timer
    const stop = watch(
        busy,
        value => {
            clearTimeout(timer)
            if (!value) visible.value = false
            else
                timer = setTimeout(() => {
                    visible.value = true
                }, delay)
        },
        { immediate: true }
    )
    onScopeDispose(() => {
        clearTimeout(timer)
        stop()
    })
    return visible
}
