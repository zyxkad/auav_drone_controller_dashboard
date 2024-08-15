<script setup lang="ts">
import { ref, reactive, readonly, onBeforeMount, onMounted } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import type { ToastMessageOptions } from 'primevue/toast'
import Button from 'primevue/button'
import Toast from 'primevue/toast'
import DirectorSetupDialog from '@/components/DirectorSetupDialog.vue'
import DirectorControlDialog from '@/components/DirectorControlDialog.vue'
import type { DroneInfo, DroneStatusInfo, DronePositionInfo, DronePingInfo } from '@/api'
import { DroneStatus } from '@/api'
import { onAwsEvent, sendAwsMessage } from '@/stores/aws'
import * as api from '@/api/instance'

const toast = useToast()

const loraConnected = ref(true)
const rtkConnected = ref(true)
const directorSetup = ref<typeof DirectorSetupDialog>()
const showDirector = ref(false)

const drones = reactive<Map<number, DroneInfo>>(new Map())
const readonlyDrones = readonly(drones)

interface ToastMessage {
	level: ToastMessageOptions['severity']
	title: string
	msg: string
	life: number
}

onAwsEvent<ToastMessage>('toast', ({ data }) => {
	toast.add({
		severity: data.level,
		summary: data.title,
		detail: data.msg,
		life: data.life,
	})
})

// TODO: query drone list once websocket connected
onAwsEvent<number>('drone-connected', ({ data }) => {
	const d = drones.get(data)
	if (d) {
		d.status = DroneStatus.UNSTABLE
	} else {
		drones.set(data, {
			id: data,
			status: DroneStatus.UNSTABLE,
		})
	}
})

onAwsEvent<number>('drone-disconnected', ({ data }) => {
	const d = drones.get(data)
	if (d) {
		d.status = DroneStatus.NONE
	}
})

onAwsEvent<(DroneStatusInfo & DronePositionInfo)[]>('drone-list', ({ data }) => {
	for (const item of data) {
		const d = drones.get(item.id)
		if (d) {
			Object.assign(d, item)
		} else {
			drones.set(item.id, item)
		}
	}
})

onAwsEvent<DroneStatusInfo>('drone-info', ({ data }) => {
	const d = drones.get(data.id)
	if (!d) {
		return
	}
	Object.assign(d, data)
})

onAwsEvent<DronePositionInfo>('drone-pos', ({ data }) => {
	const d = drones.get(data.id)
	if (!d) {
		return
	}
	Object.assign(d, data)
})

onAwsEvent<DronePingInfo>('drone-ping', ({ data }) => {
	const d = drones.get(data.id)
	if (!d) {
		return
	}
	Object.assign(d, data)
})

onBeforeMount(() => {
	sendAwsMessage('drone-list-req')
})

onMounted(() => {
	api.connectedLoraPort().then((config) => {
		loraConnected.value = !!config
	})
	api.connectedRtkPort().then((config) => {
		rtkConnected.value = !!config
	})
	api.pollDirector().then((res) => {
		if (res.ok) {
			showDirector.value = true
		}
	})
})
</script>

<template>
	<header>
		<div class="no-select logo">
			<RouterLink to="/">
				<img src="/logo.png" />
			</RouterLink>
		</div>
		<nav class="head-nav">
			<RouterLink to="/setup/lora">
				<Button :severity="loraConnected ? 'secondary' : 'primary'" label="Setup Lora" />
			</RouterLink>
			<RouterLink to="/setup/rtk">
				<Button :severity="rtkConnected ? 'secondary' : 'primary'" label="Setup RTK" />
			</RouterLink>
			<RouterLink to="/setup/satellite">
				<Button severity="info" label="Satellite" />
			</RouterLink>
			<Button severity="contrast" label="Director" @click="directorSetup?.open()" />
		</nav>
	</header>

	<RouterView v-slot="{ Component }">
		<!-- TODO: embed HomeView but not use router -->
		<KeepAlive include="HomeView">
			<component
				:is="Component"
				:drones="readonlyDrones"
				@lora-bind="loraConnected = true"
				@rtk-bind="rtkConnected = true"
			/>
		</KeepAlive>
	</RouterView>
	<DirectorSetupDialog ref="directorSetup" @setup="showDirector = true" />
	<DirectorControlDialog v-if="showDirector" @destroyed="showDirector = false" :drones="readonlyDrones" />
	<Toast position="top-right" />
</template>

<style scoped>
header {
	position: absolute;
	top: -4rem;
	left: 0;
	display: flex;
	flex-direction: row;
	align-items: center;
	width: 100%;
	height: 4rem;
	background-color: color-mix(in srgb, var(--p-primary-400) 15%, #0000);
	box-shadow: #0008 0 0 1rem -0.5rem;
	line-height: 1.5;
}

.logo {
	display: inline-block;
	width: 4rem;
	height: 4rem;
	margin-left: 1rem;
}

.logo img {
	width: 100%;
	height: 100%;
}

.head-nav {
	display: flex;
	flex-direction: row;
	align-items: center;
}

.head-nav > * {
	margin-left: 1rem;
}
</style>
