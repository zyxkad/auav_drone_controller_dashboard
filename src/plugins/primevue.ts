import type { App } from 'vue'
import PrimeVue from 'primevue/config'
import { definePreset } from '@primevue/themes'
import Aura from '@primevue/themes/aura'
import FocusTrap from 'primevue/focustrap'
import ToastService from 'primevue/toastservice'

export default function applyPlugin(app: App): void {
	const primaryColor = 'indigo'
	app.use(PrimeVue, {
		ripple: true,
		theme: {
			preset: definePreset(Aura, {
				semantic: {
					primary: {
						50: `{${primaryColor}.50}`,
						100: `{${primaryColor}.100}`,
						200: `{${primaryColor}.200}`,
						300: `{${primaryColor}.300}`,
						400: `{${primaryColor}.400}`,
						500: `{${primaryColor}.500}`,
						600: `{${primaryColor}.600}`,
						700: `{${primaryColor}.700}`,
						800: `{${primaryColor}.800}`,
						900: `{${primaryColor}.900}`,
						950: `{${primaryColor}.950}`,
					},
				},
			}),
			options: {
				darkModeSelector: 'system',
				cssLayer: false,
			},
		},
	})
	app.use(ToastService)
	app.directive('focustrap', FocusTrap)
}
