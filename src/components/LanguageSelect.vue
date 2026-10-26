<template>
    <Select
        :model-value="locale"
        :options="localeOptions"
        option-label="label"
        option-value="value"
        :aria-label="t('app.language')"
        @update:model-value="setLocale"
    />
</template>
<script setup>
import Select from 'primevue/select'
import { useI18n } from 'vue-i18n'
import { localeOptions, setLocale } from '../i18n'
const { t, locale } = useI18n()
</script>
