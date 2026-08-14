// src/plugins/primevue.js
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import SpeedDial from 'primevue/speeddial'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'

// 这里把常用的 PrimeVue 组件统一注册
export default {
    install(app) {
        app.component('DataTable', DataTable)
        app.component('Column', Column)
        app.component('Button', Button)
        app.component('SpeedDial', SpeedDial)
        app.component('InputText', InputText)
        app.component('Select', Select)
        app.component('DatePicker', DatePicker)
    }
}
