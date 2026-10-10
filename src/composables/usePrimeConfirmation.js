import { useConfirm } from 'primevue/useconfirm'
import { useI18n } from 'vue-i18n'

export function usePrimeConfirmation() {
    const confirmation = useConfirm()
    const { t } = useI18n()
    return message =>
        new Promise(resolve => {
            let settled = false
            const finish = value => {
                if (settled) return
                settled = true
                resolve(value)
            }
            confirmation.require({
                message,
                icon: 'pi pi-exclamation-triangle',
                acceptLabel: t('common.delete'),
                rejectLabel: t('common.cancel'),
                acceptProps: { severity: 'danger' },
                accept: () => finish(true),
                reject: () => finish(false),
                onHide: () => finish(false)
            })
        })
}
