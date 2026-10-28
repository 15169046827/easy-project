import { expect, test } from '@playwright/test'

for (const width of [1920, 1280, 960, 375]) {
    for (const dark of [false, true]) {
        test(`shared task statistics and drawer at ${width}px dark=${dark}`, async ({ page }) => {
            await page.setViewportSize({ width, height: 800 })
            await page.route('http://127.0.0.1:4173/', async route => {
                const response = await route.fetch()
                await route.fulfill({
                    response,
                    body: (await response.text()).replace(
                        /<style>/g,
                        '<style nonce="refinement-nonce">'
                    ),
                    headers: {
                        ...response.headers(),
                        'content-security-policy':
                            "default-src 'self'; script-src 'self'; style-src 'self' 'nonce-refinement-nonce'; style-src-attr 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https://home-host.tail2956dd.ts.net"
                    }
                })
            })
            await page.addInitScript(
                ({ dark }) => {
                    localStorage.setItem('easyproject-lang', 'zh-CN')
                    localStorage.setItem('easyproject-theme', dark ? 'dark' : 'light')
                    localStorage.setItem('easyproject-onboarding-done', 'true')
                    for (const key of [
                        'easyproject-task-columns-global-v1',
                        'easyproject-task-columns-embedded-v1'
                    ])
                        localStorage.setItem(
                            key,
                            JSON.stringify([
                                'project_id',
                                'parent',
                                '_predecessorIds',
                                'end_time',
                                'priority',
                                'status',
                                'progress'
                            ])
                        )
                    sessionStorage.setItem('easyproject.local-launch', 'desktop-preview')
                    window.isTauri = true
                    window.__EASY_PROJECT_CALLS__ = []
                    const colors = [
                        '#64748b',
                        '#3b82f6',
                        '#22c55e',
                        '#8b5cf6',
                        '#14b8a6',
                        '#f59e0b',
                        '#f43f5e',
                        '#06b6d4'
                    ]
                    const states = colors.map((color, i) => ({
                        id: 's' + i,
                        project_id: 'p1',
                        name: ['Pending', 'InProgress', 'Done'][i] || 'Phase ' + i,
                        builtin_key: ['Pending', 'InProgress', 'Done'][i] || '',
                        color,
                        is_completed: i === 2,
                        is_default: i === 0,
                        sort_order: i
                    }))
                    states.push({
                        id: 'empty',
                        project_id: 'p1',
                        name: 'No tasks',
                        builtin_key: '',
                        is_completed: false,
                        is_default: false,
                        color: '#d946ef',
                        sort_order: 9
                    })
                    const tasks = colors.map((_, i) => ({
                        id: 't' + i,
                        project_id: 'p1',
                        name:
                            i === 0
                                ? 'Parent goal'
                                : i === 1
                                  ? 'Child with a long complete name for tooltip'
                                  : 'Execution ' + i,
                        parent: i === 1 ? 't0' : '',
                        status_id: 's' + i,
                        status: states[i].name,
                        status_builtin_key: states[i].builtin_key,
                        is_completed: i === 2,
                        priority: i === 3 ? 'High' : 'Normal',
                        type: 'Task',
                        progress: i === 2 ? 100 : i === 3 ? 0 : 30,
                        effort_days: 2,
                        effort_state: 'estimated',
                        start_time: '2026-10-27',
                        end_time: '2026-10-28',
                        schedule_mode: 'fixed_effort',
                        sort_order: i,
                        comment: 'Synthetic task details',
                        assignee: '',
                        summary:
                            i === 0
                                ? {
                                      has_children: true,
                                      direct_child_count: 1,
                                      completed_child_count: 0,
                                      effort_days: 2,
                                      progress: /** @type {number|null} */ (30),
                                      unestimated_count: 0
                                  }
                                : undefined
                    }))
                    states[4].name = '等待决策 · A deliberately long custom status label'
                    tasks[4].status = states[4].name
                    for (const { id, parent, state, progress } of [
                        { id: 'child-zero', parent: 't0', state: 4, progress: 0 },
                        { id: 'child-done', parent: 't0', state: 2, progress: 100 },
                        { id: 'child-parent', parent: 't0', state: 5, progress: 0 },
                        { id: 'grandchild', parent: 'child-parent', state: 4, progress: 0 }
                    ]) {
                        tasks.push({
                            ...tasks[1],
                            id,
                            parent,
                            name: id + ' · Complete nested task title',
                            status_id: states[state].id,
                            status: states[state].name,
                            status_builtin_key: states[state].builtin_key,
                            is_completed: state === 2,
                            progress,
                            summary:
                                id === 'child-parent'
                                    ? {
                                          has_children: true,
                                          direct_child_count: 1,
                                          completed_child_count: 0,
                                          effort_days: 0,
                                          progress: null,
                                          unestimated_count: 1
                                      }
                                    : undefined
                        })
                    }
                    tasks[0].summary.direct_child_count = 4
                    tasks[0].summary.completed_child_count = 1
                    states.push({ ...states[0], id: 'second-pending', project_id: 'p2' })
                    tasks.push({
                        ...tasks[0],
                        id: 'second-project-task',
                        project_id: 'p2',
                        name: 'Cross-project pending task',
                        status_id: 'second-pending',
                        summary: undefined
                    })
                    const statistics = {
                        top_level: {
                            total: tasks.filter(task => !task.parent).length,
                            statuses: states.map(s => ({
                                ...s,
                                count: tasks.filter(t => !t.parent && t.status_id === s.id).length
                            }))
                        },
                        all_tasks: {
                            total: tasks.length,
                            statuses: states.map(s => ({
                                ...s,
                                count: tasks.filter(t => t.status_id === s.id).length
                            }))
                        }
                    }
                    window.__TAURI_INTERNALS__ = {
                        invoke: async (command, args) => {
                            window.__EASY_PROJECT_CALLS__.push({ command, args })
                            if (command !== 'crud_action') return null
                            if (args.action !== 'get_all')
                                throw Error('Read-only refinement fixture')
                            if (args.model === 'project')
                                return {
                                    success: true,
                                    data: {
                                        list: [
                                            {
                                                id: 'p1',
                                                name: 'Refinement fixture',
                                                status: 'InProgress',
                                                type: 'Private',
                                                owner: '',
                                                version: '1.0'
                                            }
                                        ],
                                        total: 1
                                    }
                                }
                            if (args.model === 'task_status')
                                return {
                                    success: true,
                                    data: {
                                        list: states.filter(
                                            state => state.project_id === args.data.projectId
                                        )
                                    }
                                }
                            if (args.model === 'task') {
                                const source = args.data?.projectId
                                    ? tasks.filter(task => task.project_id === args.data.projectId)
                                    : tasks
                                const filtered = args.data?.statusIds
                                    ? source.filter(task =>
                                          args.data.statusIds.includes(task.status_id)
                                      )
                                    : args.data?.status
                                      ? source.filter(task => task.status_id === args.data.status)
                                      : source
                                const counts =
                                    args.data?.status || args.data?.statusIds
                                        ? Object.fromEntries(
                                              Object.entries(statistics).map(([scope, group]) => [
                                                  scope,
                                                  {
                                                      total: filtered.length,
                                                      statuses: group.statuses.map(state => ({
                                                          ...state,
                                                          count: filtered.filter(
                                                              task => task.status_id === state.id
                                                          ).length
                                                      }))
                                                  }
                                              ])
                                          )
                                        : Object.fromEntries(
                                              Object.entries(statistics).map(([scope, group]) => [
                                                  scope,
                                                  {
                                                      total:
                                                          scope === 'top_level'
                                                              ? source.filter(task => !task.parent)
                                                                    .length
                                                              : source.length,
                                                      statuses: group.statuses.filter(
                                                          state =>
                                                              !args.data?.projectId ||
                                                              state.project_id ===
                                                                  args.data.projectId
                                                      )
                                                  }
                                              ])
                                          )
                                return {
                                    success: true,
                                    data: {
                                        list: filtered,
                                        total: filtered.length,
                                        statistics: counts
                                    }
                                }
                            }
                            return { success: true, data: { list: [], total: 0 } }
                        }
                    }
                },
                { dark }
            )
            for (const route of ['/#/tasks', '/#/project/p1']) {
                await page.goto(route)
                await expect(page.locator('.statistics-cards .status-stat')).toHaveCount(7)
                if (!route.includes('project')) {
                    const pending = page
                        .locator('.status-stat')
                        .filter({ has: page.locator('.status-name', { hasText: /^待办$/ }) })
                    await expect(pending.locator('strong')).toHaveText('2')
                    await pending.click()
                    await expect(page.locator('tbody')).toContainText('Cross-project pending task')
                    await expect(page.locator('tbody')).toContainText('Parent goal')
                    await expect(page.locator('.status-stat')).toHaveCount(7)
                    await page.getByRole('button', { name: '清除', exact: true }).click()
                }
                const progress = await page.locator('td > .mini-progress').evaluateAll(elements =>
                    elements.map(el => {
                        const cell = el.closest('td').getBoundingClientRect()
                        const bar = el.querySelector('.mini-progress-bar').getBoundingClientRect()
                        const label = el.querySelector('small')
                        const box = label.getBoundingClientRect()
                        return {
                            value: label.textContent,
                            offset: box.left - cell.left,
                            barWidth: bar.width,
                            fits: box.right <= cell.right,
                            align: getComputedStyle(label).textAlign
                        }
                    })
                )
                expect(progress.some(item => item.value === '0%')).toBe(true)
                expect(progress.some(item => item.value === '100%')).toBe(true)
                for (const item of progress) {
                    expect(item.align).toBe('left')
                    expect(item.fits).toBe(true)
                    expect(item.barWidth).toBeCloseTo(56, 0)
                    expect(item.offset).toBeCloseTo(progress[0].offset, 0)
                }
                await expect(page.locator('.statistics-cards')).not.toContainText('No tasks')
                const priorityBadge = page
                    .locator('.priority-badge')
                    .filter({ hasText: 'P2' })
                    .first()
                await expect(priorityBadge).toBeVisible()
                await expect(priorityBadge).toHaveCSS(
                    'color',
                    await page
                        .locator('.task-status-badge .status-label')
                        .first()
                        .evaluate(el => getComputedStyle(el).color)
                )
                expect(
                    await priorityBadge.evaluate(
                        el => getComputedStyle(el, '::before').backgroundColor
                    )
                ).not.toBe('rgba(0, 0, 0, 0)')
                await expect(page.locator('.hierarchy-statistics [role="combobox"]')).toHaveCount(0)
                const stats = page.locator('.hierarchy-statistics')
                expect(await stats.evaluate(el => getComputedStyle(el).overflowY)).toBe('visible')
                const scopeToggle = page.getByRole('button', {
                    name: '当前：顶层任务；点击切换为全部任务',
                    exact: true
                })
                await scopeToggle.hover()
                await expect(page.getByRole('tooltip')).toHaveText(
                    '当前：顶层任务；点击切换为全部任务'
                )
                await page.mouse.move(0, 0)
                await scopeToggle.press('Enter')
                await expect(page.locator('.statistics-cards .status-stat')).toHaveCount(8)
                await page
                    .getByRole('button', {
                        name: '当前：全部任务；点击切换为顶层任务',
                        exact: true
                    })
                    .click()
                const overviewBefore = await page.locator('.status-stat').allTextContents()
                await expect(page.locator('.status-name').first()).toHaveText('待办')
                expect((await page.locator('.status-stat').first().boundingBox()).width).toBe(192)
                const phase = page.locator('.status-stat').filter({ hasText: 'Phase 3' })
                await phase.click()
                await expect
                    .poll(() =>
                        page.evaluate(
                            () =>
                                window.__EASY_PROJECT_CALLS__
                                    .filter(
                                        c =>
                                            c.args?.model === 'task' &&
                                            c.args?.action === 'get_all' &&
                                            c.args.data.pageSize === 20 &&
                                            Object.hasOwn(c.args.data, 'status')
                                    )
                                    .at(-1)?.args.data.statusIds?.[0] ||
                                window.__EASY_PROJECT_CALLS__
                                    .filter(
                                        c => c.args?.model === 'task' && c.args.data.pageSize === 20
                                    )
                                    .at(-1)?.args.data.status
                        )
                    )
                    .toBe('s3')
                await expect(page.locator('.filter-bar .p-select').first()).toContainText('Phase 3')
                await expect(page.locator('.statistics-cards .status-stat')).toHaveCount(7)
                await expect(page.locator('.status-stat')).toHaveText(overviewBefore)
                expect((await phase.boundingBox()).width).toBe(192)
                const tag = page.locator('tbody .task-status-badge').filter({ hasText: 'Phase 3' })
                const accent = await phase
                    .locator('.status-dot')
                    .evaluate(el => getComputedStyle(el).backgroundColor)
                expect(accent).toBe(
                    await tag
                        .locator('.status-dot')
                        .evaluate(el => getComputedStyle(el).backgroundColor)
                )
                expect(await tag.evaluate(el => getComputedStyle(el).backgroundColor)).not.toBe(
                    accent
                )
                expect(await phase.evaluate(el => getComputedStyle(el).backgroundColor)).not.toBe(
                    accent
                )
                if (width === 1280 && !dark && !route.includes('project')) {
                    await page.mouse.move(0, 0)
                    await page.screenshot({
                        path: 'src-tauri/target/audit-tools/status-cards-c5902ab/fixed-neutral-cards-preview.png'
                    })
                }
                await phase.click()
                await expect
                    .poll(() =>
                        page.evaluate(
                            () =>
                                window.__EASY_PROJECT_CALLS__
                                    .filter(
                                        c =>
                                            c.args?.model === 'task' &&
                                            c.args?.action === 'get_all' &&
                                            c.args.data.pageSize === 20 &&
                                            Object.hasOwn(c.args.data, 'status')
                                    )
                                    .at(-1)?.args.data.status
                        )
                    )
                    .toBe('')
                const table = page.locator('.table-card')
                await table.scrollIntoViewIfNeeded()
                const before = (await table.boundingBox()).height
                await page.getByRole('button', { name: '折叠状态统计', exact: true }).press('Enter')
                await expect(page.locator('.statistics-cards')).toHaveCount(0)
                await table.scrollIntoViewIfNeeded()
                expect((await table.boundingBox()).height).toBeGreaterThanOrEqual(before)
                if (width >= 1280)
                    expect((await table.boundingBox()).height).toBeGreaterThan(before + 1)
                const filterBar = page.locator('.filter-bar')
                const searchButton = filterBar.getByRole('button', { name: '搜索', exact: true })
                await expect(searchButton).toBeVisible()
                for (const name of ['搜索', '清除']) {
                    const button = filterBar.getByRole('button', { name, exact: true })
                    expect(await button.evaluate(el => getComputedStyle(el).whiteSpace)).toBe(
                        'nowrap'
                    )
                    expect((await button.boundingBox()).height).toBeLessThanOrEqual(42)
                }
                if (width === 960) {
                    expect(
                        await filterBar.evaluate(
                            el => getComputedStyle(el).gridTemplateColumns.split(' ').length
                        )
                    ).toBe(4)
                }
                await page.getByRole('button', { name: '恢复默认列', exact: true }).click()
                await expect(
                    page.getByRole('columnheader', { name: '优先级', exact: true })
                ).toHaveCount(0)
                const expanded = page.getByRole('button', { name: '折叠任务', exact: true }).first()
                if (await expanded.count()) await expanded.click()
                await page.getByRole('button', { name: '展开任务', exact: true }).first().click()
                const drawer = page.locator('.child-drawer').first()
                await expect(drawer).toContainText('Child with a long complete name')
                const metrics = drawer.locator(':scope > .child-entry > .child-row .child-metrics')
                await expect(metrics).toHaveCount(4)
                const positions = await metrics.evaluateAll(elements =>
                    elements.map(el => {
                        const status = el.querySelector('.child-status').getBoundingClientRect()
                        const progress = el.querySelector('.child-progress')
                        return {
                            statusX: status.left,
                            progressX: progress.getBoundingClientRect().left,
                            aligned: el.closest('.child-row').classList.contains('aligned-columns'),
                            align: getComputedStyle(progress).textAlign,
                            value: progress.textContent
                        }
                    })
                )
                expect(positions.some(item => item.value === '0%')).toBe(true)
                expect(positions.some(item => item.value === '100%')).toBe(true)
                for (const item of positions) {
                    expect(item.statusX).toBeCloseTo(positions[0].statusX, 0)
                    expect(item.progressX).toBeCloseTo(positions[0].progressX, 0)
                    expect(item.align).toBe('left')
                }
                if (width >= 1280) {
                    expect(positions.every(item => item.aligned)).toBe(true)
                    const outer = await page
                        .locator('tbody tr')
                        .filter({ has: page.locator('.task-tree-name') })
                        .first()
                        .evaluate(row => ({
                            status: row.querySelector('.task-status-badge').getBoundingClientRect()
                                .left,
                            progress: row.querySelector('.mini-progress').getBoundingClientRect()
                                .left
                        }))
                    expect(positions[0].statusX).toBeCloseTo(outer.status, 0)
                    expect(positions[0].progressX).toBeCloseTo(outer.progress, 0)
                    const fits = await drawer
                        .locator(':scope > .child-entry > .child-row')
                        .evaluateAll(rows =>
                            rows.every(row =>
                                Array.from(row.querySelectorAll('.child-actions button')).every(
                                    button =>
                                        button.getBoundingClientRect().right <=
                                        row.getBoundingClientRect().right
                                )
                            )
                        )
                    expect(fits).toBe(true)
                }
                await drawer.getByRole('button', { name: '展开任务', exact: true }).click()
                await expect(drawer.locator('.child-drawer .child-progress')).toHaveText('0%')
                const longStatus = metrics.nth(1).locator('.p-tag')
                expect(
                    await longStatus.evaluate(
                        el =>
                            el.getBoundingClientRect().right <=
                            el.parentElement.getBoundingClientRect().right + 1
                    )
                ).toBe(true)
                await longStatus.hover()
                await expect(page.getByRole('tooltip')).toContainText('deliberately long')
                await page.mouse.move(0, 0)
                const drawerBox = await drawer.boundingBox(),
                    tableBox = await table.boundingBox()
                expect(tableBox.x + tableBox.width - drawerBox.x - drawerBox.width).toBeGreaterThan(
                    8
                )
                expect(tableBox.x + tableBox.width - drawerBox.x - drawerBox.width).toBeLessThan(50)
                expect(
                    await page.evaluate(
                        () => document.documentElement.scrollWidth <= innerWidth + 1
                    )
                ).toBe(true)
                const header = page.locator('.task-page-header')
                await header.getByRole('button', { name: '展开状态统计', exact: true }).click()
                await expect(page.locator('.hierarchy-statistics')).toBeVisible()
                await table.scrollIntoViewIfNeeded()
                const beforeCollapse = await table.evaluate(
                    el => /** @type {HTMLElement} */ (el).offsetTop
                )
                await header.getByRole('button', { name: '折叠状态统计', exact: true }).click()
                await expect(page.locator('.hierarchy-statistics')).toHaveCount(0)
                await header.getByRole('button', { name: '折叠搜索和筛选', exact: true }).click()
                await expect(page.locator('.filter-card')).toHaveCount(0)
                expect(
                    await table.evaluate(el => /** @type {HTMLElement} */ (el).offsetTop)
                ).toBeLessThan(beforeCollapse)
                await header
                    .getByRole('button', { name: '展开状态统计', exact: true })
                    .press('Enter')
                await header
                    .getByRole('button', { name: '展开搜索和筛选', exact: true })
                    .press('Enter')
                await expect(page.locator('.hierarchy-statistics')).toBeVisible()
                await expect(page.locator('.filter-card')).toBeVisible()
                await page.screenshot({
                    path: `test-results/task-refinement-${route.includes('project') ? 'project' : 'global'}-${width}-${dark}.png`
                })
            }
        })
    }
}
