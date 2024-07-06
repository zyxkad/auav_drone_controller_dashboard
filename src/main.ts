import { createApp } from 'vue'
import { createPinia } from 'pinia'

import '@/assets/main.css'
import 'primeicons/primeicons.css'

async function createMyApp() {
	const [{ default: App }, { default: router }, { default: applyPrimeVue }] = await Promise.all([
		import('@/App.vue'),
		import('@/router'),
		import('@/plugins/primevue'),
	])
	const app = createApp(App)

	app.use(createPinia())
	app.use(router)
	applyPrimeVue(app)

	app.mount('#app')
}
createMyApp()
