<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import DroneList from '@/components/DroneList.vue'
import DroneStatus from '@/components/DroneStatus.vue'
import LogBlock from '@/components/LogBlock.vue'
import RtkStatus from '@/components/RtkStatus.vue'
import type { DroneInfo } from '@/api'
import * as api from '@/api/instance'

const logBlk = ref<InstanceType<typeof LogBlock>>()

const drones = reactive<DroneInfo[]>([
	{
		id: 123,
		status: 'N/A',
		battery: {
			voltage: 17.123,
			current: 99.876,
			remaining: 0.5421,
		},
		gps: {
			type: 5,
			lat: 50.123456,
			lon: 12.987654,
			alt: 9876.54,
		},
		lastActivate: Date.now(),
	},
	{
		id: 1,
		status: 'READY',
		battery: {
			voltage: 17.123,
			current: 99.876,
			remaining: 0.5421,
		},
		gps: {
			type: 3,
			lat: 50.123456,
			lon: 12.987654,
			alt: 9876.54,
		},
		lastActivate: Date.now() + 3000,
	},
	{
		id: 5,
		status: 'SLEEPING',
		battery: {
			voltage: 17.123,
			current: 99.876,
			remaining: 0.5421,
		},
		gps: {
			type: 1,
			lat: 50.123456,
			lon: 12.987654,
			alt: 9876.54,
		},
		lastActivate: Date.now() + 3000,
	},
	{
		id: 2,
		status: 'ARMED',
		battery: {
			voltage: 17.123,
			current: 99.876,
			remaining: 0.5421,
		},
		gps: {
			type: 2,
			lat: 50.123456,
			lon: 12.987654,
			alt: 9876.54,
		},
		lastActivate: Date.now() + 3000,
	},
	{
		id: 3,
		status: 'TAKENOFF',
		battery: {
			voltage: 17.123,
			current: 99.876,
			remaining: 0.5421,
		},
		gps: {
			type: 0,
			lat: 50.123456,
			lon: 12.987654,
			alt: 9876.54,
		},
		lastActivate: Date.now() + 3000,
	},
	{
		id: 4,
		status: 'ERROR',
		battery: {
			voltage: 17.123,
			current: 99.876,
			remaining: 0.5421,
		},
		gps: {
			type: 6,
			lat: 50.123456,
			lon: 12.987654,
			alt: 9876.54,
		},
		lastActivate: Date.now() + 3000,
	},
])
</script>

<template>
	<main id="main">
		<RtkStatus class="no-select rtk-status" />
		<DroneStatus class="no-select drone-status" :drones="drones" />
		<DroneList class="drone-list" :drones="drones" />
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
		'd r' 10rem
		'd l' auto
		's l' 13rem
		/ min(60%, 60rem) auto;
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
