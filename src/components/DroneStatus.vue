<script setup lang="ts">
import { computed } from 'vue'
import Card from 'primevue/card'
import { DroneStatus, type DroneInfo } from '@/api'

const props = defineProps<{
	drones: DroneInfo[]
}>()

function countDrones(tester: (drone: DroneInfo) => boolean): number {
	let count = 0
	for (const drone of props.drones) {
		if (tester(drone)) {
			count++
		}
	}
	return count
}

const droneCount = computed(() => props.drones.length)
const connectedDrones = computed(() => countDrones((d) => d.status !== DroneStatus.NONE))
const missingDrones = computed(() => props.drones.length - connectedDrones.value)
const sleepingDrones = computed(() => countDrones((d) => d.status === DroneStatus.SLEEPING))
const readyDrones = computed(() => countDrones((d) => d.status === DroneStatus.READY))
const armingDrones = computed(() => countDrones((d) => d.status === DroneStatus.ARMED))
const flyingDrones = computed(() => countDrones((d) => d.status === DroneStatus.TAKENOFF))
const errorDrones = computed(() => countDrones((d) => d.status === DroneStatus.ERROR))
</script>

<template>
	<Card>
		<template #title>
			<h3 class="no-margin">Drone Status</h3>
		</template>
		<template #content>
			<div class="status-box">
				<div class="total">
					<h4>Total</h4>
					<b>{{ droneCount }}</b>
				</div>
				<div class="connecting">
					<h4>Connected</h4>
					<b>{{ connectedDrones }}</b>
				</div>
				<div class="missing">
					<h4>Missing</h4>
					<b>{{ missingDrones }}</b>
				</div>
				<div class="sleeping">
					<h4>Sleeping</h4>
					<b>{{ sleepingDrones }}</b>
				</div>
				<div class="ready">
					<h4>Ready</h4>
					<b>{{ readyDrones }}</b>
				</div>
				<div class="arming">
					<h4>Arming</h4>
					<b>{{ armingDrones }}</b>
				</div>
				<div class="flying">
					<h4>Taken Off</h4>
					<b>{{ flyingDrones }}</b>
				</div>
				<div class="errors">
					<h4>Errors</h4>
					<b>{{ errorDrones }}</b>
				</div>
			</div>
		</template>
	</Card>
</template>

<style scoped>
h4 {
	margin: 0;
}

.status-box {
	display: grid;
	width: 100%;
	height: 100%;
	grid-gap: 0.5rem;
	grid-template:
		". L C M ." 3rem
		"S R A T E" 3rem
		/ auto auto auto auto auto;
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
.errors {
	grid-area: E;
}

</style>
