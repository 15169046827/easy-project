import vue from 'eslint-plugin-vue'
import prettier from 'eslint-plugin-prettier'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

export default [
    ...vue.configs['flat/essential'],
    {
        languageOptions: {
            globals: {
                console: 'readonly',
                window: 'readonly',
                alert: 'readonly',
                confirm: 'readonly',
                structuredClone: 'readonly'
            },
            ecmaVersion: 'latest'
        },
        plugins: { prettier },
        rules: {
            indent: ['error', 4],
            semi: ['error', 'never'],
            quotes: ['error', 'single'],
            'vue/multi-word-component-names': 'off',
            'vue/no-reserved-component-names': 'off'
        }
    },
    eslintPluginPrettierRecommended,
    {
        files: [
            'src/modules/calendar/utils/ics.js',
            'src/modules/gantt/utils/criticalPath.js',
            'src/components/ResourceLoadPanel.vue',
            'src/modules/task/composables/useTaskReordering.js',
            'src/modules/gantt/composables/usePlanBaseline.js',
            'src/modules/gantt/utils/baselinePresentation.js',
            'src/modules/gantt/composables/useGanttCreateEditor.js',
            'src/modules/gantt/composables/useGanttEditEditor.js',
            'src/modules/gantt/utils/taskFormSchedule.js',
            'src/modules/gantt/composables/useDocumentDragListeners.js',
            'src/modules/task/composables/useTaskListQuery.js',
            'src/modules/task/composables/useTaskRowEditor.js',
            'src/modules/task/utils/taskRowPersistence.js',
            'src/modules/gantt/utils/viewportCalendar.js',
            'src/modules/gantt/composables/useGanttViewport.js',
            'src/modules/gantt/composables/useGanttNavigation.js',
            'src/modules/gantt/composables/useGanttTaskDragging.js',
            'src/modules/gantt/composables/useGanttProjectData.js',
            'src/modules/gantt/components/GanttView.vue',
            'src/modules/task/components/TaskList/TaskList.vue'
        ],
        rules: {
            complexity: ['error', 20],
            'max-lines-per-function': [
                'error',
                { max: 100, skipBlankLines: true, skipComments: true }
            ]
        }
    }
]
