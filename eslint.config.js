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
    eslintPluginPrettierRecommended
]
