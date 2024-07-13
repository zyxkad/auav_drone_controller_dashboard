<script setup lang="ts">
import { computed } from 'vue'
import Card from 'primevue/card'
import { DroneStatus, type DroneInfo } from '@/api'

const props = defineProps<{
	drones: ReadonlyMap<number, DroneInfo>
}>()

function countDrones(tester: (drone: DroneInfo) => boolean): number {
	let count = 0
	for (const drone of props.drones.values()) {
		if (tester(drone)) {
			count++
		}
	}
	return count
}

const droneCount = computed(() => props.drones.size)
const connectedDrones = computed(() => countDrones((d) => d.status !== DroneStatus.NONE))
const missingDrones = computed(() => props.drones.size - connectedDrones.value)
const sleepingDrones = computed(() => countDrones((d) => d.status === DroneStatus.SLEEPING))
const readyDrones = computed(() => countDrones((d) => d.status === DroneStatus.READY))
const armingDrones = computed(() => countDrones((d) => d.status === DroneStatus.ARMED))
const flyingDrones = computed(() => countDrones((d) => d.status === DroneStatus.TAKENOFF))
const navDrones = computed(() => countDrones((d) => d.status === DroneStatus.NAV))
const errorDrones = computed(() => countDrones((d) => d.status === DroneStatus.ERROR))
</script>

<template>
	<Card>
		<template #title>
			<h3 class="no-margin no-wrap">Drone Overview</h3>
		</template>
		<template #content>
			<div class="status-box">
				<div class="total">
					<h4 class="label">Total</h4>
					<b>{{ droneCount }}</b>
				</div>
				<div class="connecting">
					<h4 class="label">Connect</h4>
					<b>{{ connectedDrones }}</b>
				</div>
				<div class="missing">
					<h4 class="label">Missing</h4>
					<b>{{ missingDrones }}</b>
				</div>
				<div class="sleeping">
					<h4 class="label">Sleep</h4>
					<b>{{ sleepingDrones }}</b>
				</div>
				<div class="ready">
					<h4 class="label">Ready</h4>
					<b>{{ readyDrones }}</b>
				</div>
				<div class="arming">
					<h4 class="label">Arming</h4>
					<b>{{ armingDrones }}</b>
				</div>
				<div class="flying">
					<h4 class="label">Hover</h4>
					<b>{{ flyingDrones }}</b>
				</div>
				<div class="navigating">
					<h4 class="label">Auto</h4>
					<b>{{ navDrones }}</b>
				</div>
				<div class="errors">
					<h4 class="label">Errors</h4>
					<b>{{ errorDrones }}</b>
				</div>
			</div>
		</template>
	</Card>
</template>

<style scoped>
.status-box {
	display: grid;
	width: 100%;
	height: 100%;
	grid-gap: 0.5rem;
	grid-template:
		'L C M N E' 3rem
		'S R A T .' 3rem
		/ 1fr 1fr 1fr 1fr 1fr;
	font-family: monospace;
	white-space: nowrap;
}

.status-box > div {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.total {
	grid-area: L;
}
.connecting {
	grid-area: C;
}
.missing {
	grid-area: M;
}
.sleeping {
	grid-area: S;
}
.ready {
	grid-area: R;
}
.arming {
	grid-area: A;
}
.flying {
	grid-area: T;
}
.navigating {
	grid-area: N;
}
.errors {
	grid-area: E;
}

.label {
	display: flex;
	flex-direction: row;
	align-items: center;
	margin: 0;
}

.label::before {
	content: ' ';
	display: inline-block;
	width: 1em;
	height: 1em;
	margin: 0 0.4em 0 0;
	border-radius: 50%;
	transition: 1s background-color ease-out;
	background-color: var(--flash-out);
	--flash-from: var(--p-surface-400);
	--flash-to: var(--p-surface-400);
	animation: flash 1s infinite ease-out;
}

.missing > .label::before {
	--flash-to: var(--p-orange-500);
	animation-duration: 2.5s;
}

.ready > .label::before {
	background-color: var(--p-green-600);
	animation: none;
}

.sleeping > .label::before {
	--flash-to: var(--p-cyan-500);
	animation-duration: 4s;
}

.arming > .label::before {
	--flash-from: var(--p-yellow-600);
	--flash-to: var(--p-lime-500);
}

.flying > .label::before {
	background-color: var(--p-yellow-500);
	animation: none;
}

.navigating > .label::before {
	--flash-from: var(--p-yellow-500);
	--flash-to: var(--p-yellow-400);
	animation-duration: 2s;
}

.errors > .label::before {
	--flash-to: var(--p-red-500);
	animation-duration: 1s;
}

.status-box > div > b {
	padding-left: 0.9em;
}
</style>
