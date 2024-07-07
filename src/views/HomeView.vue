<script setup lang="ts">
import { ref, reactive, readonly, onMounted } from 'vue'
import DroneList from '@/components/DroneList.vue'
import DroneOverview from '@/components/DroneOverview.vue'
import LogBlock from '@/components/LogBlock.vue'
import RtkStatus from '@/components/RtkStatus.vue'
import type { ColorInfo, DroneInfo, DroneStatusInfo, DronePositionInfo, LogMessage } from '@/api'
import { DroneStatus } from '@/api'
import * as api from '@/api/instance'
import { onAwsEvent } from '@/stores/aws'
import { flightModeToString } from '@/data/flight_modes'

const logBlk = ref<InstanceType<typeof LogBlock>>()

const drones = reactive<Map<number, DroneInfo>>(new Map())
const readonlyDrones = readonly(drones)

function onLedChanged(drone: number, color: ColorInfo) {
	console.log('on led changed for:', drone, color)
}

onAwsEvent<LogMessage>('log', ({ data }) => {
	logBlk.value?.pushLog(data)
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

onAwsEvent<DroneStatusInfo>('drone-info', ({ data }) => {
	const d = drones.get(data.id)
	if (!d) {
		return
	}
	Object.assign(d, data, { mode: flightModeToString(data.mode) })
})

onAwsEvent<DronePositionInfo>('drone-pos-info', ({ data }) => {
	const d = drones.get(data.id)
	if (!d) {
		return
	}
	Object.assign(d, data)
})
</script>

<template>
	<main id="main">
		<RtkStatus class="no-select rtk-status" />
		<DroneOverview class="no-select drone-status" :drones="readonlyDrones" />
		<DroneList class="drone-list" :drones="readonlyDrones" @ledChanged="onLedChanged" />
		<LogBlock ref="logBlk" class="log-block" />
	</main>
</template>

<style scoped>
#main {
	display: grid;
	height: calc(100vh - 5rem);
	padding-bottom: 1rem;
	grid-gap: 0.5rem;
	grid-template:
		'd r r' 10rem
		'd l l' auto
		's l l' 13rem
		/ min(60%, 60rem) auto auto;
}

.rtk-status {
	grid-area: r;
	height: 10rem;
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
