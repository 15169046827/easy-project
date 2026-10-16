import { onUnmounted, ref } from 'vue'
import { beginBallMove, moveBall, keepFloatingVisible, nudgeBall } from './windowActions'

export function useFloatingBall(run, expand) {
    const dockEdge = ref('')
    let drag = null
    let pending = Promise.resolve()
    let suppressClick = false
    let disposed = false
    let moving = false
    let dirty = false
    onUnmounted(() => {
        disposed = true
        drag = null
    })

    function pointerDown(event) {
        if (event.button !== 0) return
        event.currentTarget.setPointerCapture(event.pointerId)
        suppressClick = false
        drag = {
            x: event.screenX,
            y: event.screenY,
            moved: false,
            origin: beginBallMove({ x: event.clientX, y: event.clientY }).catch(cause => {
                run(() => Promise.reject(cause))
                return null
            })
        }
    }
    function pointerMove(event) {
        const current = drag
        if (!current) return
        if (Math.hypot(event.screenX - current.x, event.screenY - current.y) < 4 && !current.moved)
            return
        current.moved = true
        dockEdge.value = ''
        dirty = true
        if (moving) return
        moving = true
        pending = (async () => {
            try {
                while (dirty && !disposed) {
                    dirty = false
                    await run(async () => moveBall(await current.origin))
                }
            } finally {
                moving = false
            }
        })()
    }
    async function pointerUp() {
        const current = drag
        drag = null
        if (!current?.moved) return
        suppressClick = true
        await pending
        if (disposed) return
        await run(async () => {
            dockEdge.value = await keepFloatingVisible(true)
        })
    }
    function click() {
        if (suppressClick) {
            suppressClick = false
            return
        }
        expand()
    }
    async function keydown(event) {
        const directions = {
            ArrowLeft: [-16, 0],
            ArrowRight: [16, 0],
            ArrowUp: [0, -16],
            ArrowDown: [0, 16]
        }
        const direction = directions[event.key]
        if (!direction) return
        event.preventDefault()
        await run(async () => {
            dockEdge.value = await nudgeBall(...direction)
        })
    }
    return { dockEdge, pointerDown, pointerMove, pointerUp, click, keydown }
}
