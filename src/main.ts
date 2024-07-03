import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import FocusTrap from 'primevue/focustrap'
import ToastService from 'primevue/toastservice'

import App from '@/App.vue'
import router from '@/router'

import '@/assets/main.css'
import 'primeicons/primeicons.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.use(PrimeVue, {
	ripple: true,
	theme: {
		preset: Aura,
	},
})
app.use(ToastService)
app.directive('focustrap', FocusTrap)

app.mount('#app')
