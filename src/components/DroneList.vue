<script setup lang="ts">
import { ref } from 'vue'
import Card from 'primevue/card'
import DroneItem from './DroneItem.vue'
import type { DroneInfo } from '@/api'

defineProps<{
	drones: DroneInfo[]
}>()
</script>

<template>
	<Card>
		<template #title>
			<h3 class="no-margin">Drones</h3>
		</template>
		<template #content>
			<div class="drone-list">
				<div class="drone-list-header">
					<div class="id">ID</div>
					<div class="status">STATUS</div>
					<div class="voltage">VOLTAGE</div>
					<div class="current">CURRENT</div>
					<div class="remaining">POWER</div>
					<div class="gps-type">GPS_TYPE</div>
					<div class="gps">GPS - (LAT, LON, ALT)</div>
					<div class="last-activate">LAST_ACTIVATE</div>
				</div>
				<DroneItem v-for="drone in drones" class="drone" :drone="drone" />
			</div>
		</template>
	</Card>
</template>

<style scoped>
.drone-list {
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
	font-size: 0.88rem;
	overflow: auto;
}

.drone-list-header {
	display: flex;
	flex-direction: row;
	align-items: center;
	width: 100%;
	height: 3rem;
	min-width: max-content;
	font-weight: bold;
	font-family: 'Monaco', monospace;
	border-bottom: var(--p-surface-300) solid 2px;
}

.drone-list-header > * {
	flex-shrink: 0;
	margin-right: 0.5em;
}

.id {
	width: 2em;
	margin-left: 2.6rem;
}

.status {
	width: 5em;
}

.voltage,
.current {
	width: 4.2em;
}

.remaining {
	width: 3em;
}

.gps-type {
	width: 5.5em;
}

.gps {
	width: 18em;
}
</style>
