export const expandedMinimum = { width: 340, height: 360 }
export const ballSize = 64

/** Keep the entire window inside the monitor work area, including negative origins. */
export function fitWindow(position, size, area) {
    return {
        x: Math.round(Math.max(area.x, Math.min(position.x, area.x + area.width - size.width))),
        y: Math.round(Math.max(area.y, Math.min(position.y, area.y + area.height - size.height)))
    }
}

export function snapBall(position, size, area, threshold = 24) {
    const fitted = fitWindow(position, size, area)
    const edges = [
        { edge: 'left', distance: Math.abs(fitted.x - area.x), x: area.x },
        {
            edge: 'right',
            distance: Math.abs(area.x + area.width - size.width - fitted.x),
            x: area.x + area.width - size.width
        },
        { edge: 'top', distance: Math.abs(fitted.y - area.y), y: area.y },
        {
            edge: 'bottom',
            distance: Math.abs(area.y + area.height - size.height - fitted.y),
            y: area.y + area.height - size.height
        }
    ].sort((a, b) => a.distance - b.distance)
    const nearest = edges[0]
    return nearest.distance <= threshold
        ? { x: nearest.x ?? fitted.x, y: nearest.y ?? fitted.y, edge: nearest.edge }
        : { ...fitted, edge: '' }
}
