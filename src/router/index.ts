import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import LoraSetupView from '@/views/LoraSetupView.vue'
import RtkSetupView from '@/views/RtkSetupView.vue'
import SatelliteSetupView from '@/views/SatelliteSetupView.vue'

const router = createRouter({
	history: createWebHashHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'home',
			component: HomeView,
		},
		{
			path: '/about',
			name: 'about',
			component: () => import('../views/AboutView.vue'),
		},
		{
			path: '/setup/lora',
			name: 'setup/lora',
			component: LoraSetupView,
			props: (route) => ({ nextURL: route.query.next }),
		},
		{
			path: '/setup/rtk',
			name: 'setup/rtk',
			component: RtkSetupView,
			props: (route) => ({ nextURL: route.query.next }),
		},
		{
			path: '/setup/satellite',
			name: 'setup/satellite',
			component: SatelliteSetupView,
			props: (route) => ({ nextURL: route.query.next }),
		},
	],
})

export default router
