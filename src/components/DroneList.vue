<script setup lang="ts">
import { ref, reactive } from 'vue'
import Card from 'primevue/card'
import ContextMenu from 'primevue/contextmenu'
import DroneItem from './DroneItem.vue'
import type { DroneInfo } from '@/api'

defineProps<{
	drones: DroneInfo[]
}>()

const menu = ref<InstanceType<typeof ContextMenu>>()

const selected = reactive<number[]>([])

function selectedOrAll(label: string): () => string {
	return () => (selected.length > 0 ? label : label + ' All')
}

const menuItems = ref([
	{ label: selectedOrAll('Home'), icon: 'pi pi-home' },
	{ label: selectedOrAll('Land'), icon: 'pi pi-cloud-download' },
	{ label: selectedOrAll('Disarm'), icon: 'pi pi-ban' },
	{ label: selectedOrAll('Sleep'), icon: 'pi pi-moon' },
	{ label: selectedOrAll('Wakeup'), icon: 'pi pi-eye' },
	{ label: selectedOrAll('Control Lights'), icon: 'pi pi-sliders-v' },
	{ label: selectedOrAll('Copy GPS'), icon: 'pi pi-globe' },
])

function onClickDrone(event: PointerEvent, id?: number) {
	menu.value?.hide()
	if (event.button !== 0) {
		return
	}
	if (id === undefined) {
		if (!event.metaKey) {
			selected.splice(0)
		}
		return
	}
	if (!event.metaKey) {
		selected.splice(0)
		selected.push(id)
	} else {
		let i = selected.indexOf(id)
		if (i >= 0) {
			selected.splice(i, 1)
		} else {
			selected.push(id)
		}
	}
}

function onContextMenu(event: PointerEvent, id?: number) {
	if (id !== undefined) {
		let i = selected.indexOf(id)
		if (i < 0) {
			selected.splice(0)
			selected.push(id)
		}
	}
	menu.value?.show(event)
}
</script>

<template>
	<Card @click.stop="onClickDrone" @contextmenu.stop="onContextMenu">
		<template #title>
			<h3 class="no-select no-margin">Drones</h3>
		</template>
		<template #content>
			<div class="no-select drone-list">
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
				<DroneItem
					v-for="drone in drones"
					@click.stop="onClickDrone($event, drone.id)"
					@contextmenu.stop="onContextMenu($event, drone.id)"
					class="drone"
					:drone="drone"
					:selected="selected.indexOf(drone.id) >= 0"
				/>
			</div>
			<ContextMenu ref="menu" :model="menuItems" />
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

.drone {
	cursor: pointer;
}

.drone[selected='true'] {
	background-color: var(--p-contextmenu-item-focus-background);
}
</style>
