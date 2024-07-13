<script setup lang="ts">
import { ref, reactive, readonly, onBeforeMount } from 'vue'
import { useToast } from 'primevue/usetoast'
import type { ToastMessageOptions } from 'primevue/toast'
import DroneList from '@/components/DroneList.vue'
import DroneOverview from '@/components/DroneOverview.vue'
import LogBlock from '@/components/LogBlock.vue'
import RtkStatus from '@/components/RtkStatus.vue'
import LeftRightButton from '@/components/LeftRightButton.vue'
import type { ColorInfo, DroneInfo, DroneStatusInfo, DronePositionInfo, DronePingInfo, LogMessage } from '@/api'
import { DroneStatus } from '@/api'
import { onAwsEvent, sendAwsMessage } from '@/stores/aws'
import { FlightMode } from '@/data/ardupilot'

const toast = useToast()

const logBlk = ref<InstanceType<typeof LogBlock>>()

const extLog = ref(0)
const drones = reactive<Map<number, DroneInfo>>(new Map())
const readonlyDrones = readonly(drones)

const reverseLogBoxAni = ref(false)
const extendingLog = ref(false)
const shrinkingLog = ref(false)

function extendLog(): void {
	if (extLog.value === 0) {
		if (!extendingLog.value) {
			extendingLog.value = true
			setTimeout(() => {
				extendingLog.value = false
				extLog.value = 1
			}, 650)
		}
	} else if (extLog.value === -1) {
		if (!shrinkingLog.value) {
			reverseLogBoxAni.value = true
			shrinkingLog.value = true
			setTimeout(() => {
				reverseLogBoxAni.value = false
				shrinkingLog.value = false
				extLog.value = 0
			}, 500)
		}
	}
}

function shrinkLog(): void {
	if (extLog.value === 0) {
		if (!shrinkingLog.value) {
			shrinkingLog.value = true
			setTimeout(() => {
				shrinkingLog.value = false
				extLog.value = -1
			}, 500)
		}
	} else if (extLog.value === 1) {
		if (!extendingLog.value) {
			reverseLogBoxAni.value = true
			extendingLog.value = true
			setTimeout(() => {
				reverseLogBoxAni.value = false
				extendingLog.value = false
				extLog.value = 0
			}, 650)
		}
	}
}

function onLedChanged(drone: number, color: ColorInfo) {
	console.log('on led changed for:', drone, color)
}

onAwsEvent<LogMessage>('log', ({ data }) => {
	logBlk.value?.pushLog(data)
})

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
</script>

<template>
	<main
		id="main"
		:ext-log="extLog"
		:class="{
			'reverse-animation': reverseLogBoxAni,
			'extenting-log-grid': extendingLog,
			'shrinking-log-grid': shrinkingLog,
		}"
	>
		<div class="rtk-status-wrapper">
			<RtkStatus class="no-select rtk-status" />
			<LeftRightButton
				class="r-left-right-btn"
				:disabledLeft="extLog === 1"
				:disabledRight="extLog === -1"
				@clickLeft="extendLog"
				@clickRight="shrinkLog"
			/>
		</div>
		<DroneOverview class="no-select drone-status" :drones="readonlyDrones" />
		<DroneList class="drone-list" :drones="readonlyDrones" @ledChanged="onLedChanged" />
		<LogBlock ref="logBlk" class="log-block" />
	</main>
</template>

<style scoped>
#main {
	--ext-grid-width: 0rem;
	--log-grid-width: 25rem;
	display: grid;
	height: calc(100vh - 5rem);
	padding-bottom: 1rem;
	grid-gap: 0.5rem;
	grid-template:
		'd r' 10rem
		'd l' auto
		's l' 13rem
		/ calc(100% - 0.5rem - var(--log-grid-width) + var(--ext-grid-width)) var(--log-grid-width);
	overflow: visible;
}

#main[ext-log='1'] {
	--log-grid-width: 61.8%;
}

#main[ext-log='-1'] {
	--ext-grid-width: 24rem;
}

@property --log-grid-width {
	syntax: '<length> | <length-percentage>';
	inherits: false;
	initial-value: 0;
}

@property --ext-grid-width {
	syntax: '<length> | <length-percentage>';
	inherits: false;
	initial-value: 0;
}

@keyframes extent-log-grid {
	0% {
		--log-grid-width: 25rem;
	}
	100% {
		--log-grid-width: 61.8%;
	}
}

@keyframes shrink-log-grid {
	0% {
		--ext-grid-width: 0;
	}
	100% {
		--ext-grid-width: 24rem;
	}
}

.extenting-log-grid {
	animation: extent-log-grid 0.6s ease-out forwards;
}

.shrinking-log-grid {
	animation: shrink-log-grid 0.45s ease-in forwards;
}

.reverse-animation {
	animation-direction: reverse;
}

.rtk-status-wrapper {
	position: relative;
	grid-area: r;
	height: 10rem;
}

.r-left-right-btn {
	position: absolute;
	top: -0.8rem;
	left: -0.5rem;
	width: 2.3rem;
	height: 2.5rem;
	display: none;
}

.rtk-status-wrapper:hover .r-left-right-btn {
	display: block;
}

.drone-status {
	grid-area: s;
}

.drone-list {
	grid-area: d;
}

.log-block {
	grid-area: l;
	height: 100%;
}
</style>
