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
            'src/modules/gantt/utils/baselinePresentation.js'
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
