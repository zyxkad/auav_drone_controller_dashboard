<script setup lang="ts">
import { computed, ref, reactive } from 'vue'
import Card from 'primevue/card'
import ContextMenu from 'primevue/contextmenu'
import type { MenuItem } from 'primevue/menuitem'
import { useToast } from 'primevue/usetoast'
import DroneItem from './DroneItem.vue'
import type { ColorInfo, DroneInfo } from '@/api'

const props = defineProps<{
	drones: ReadonlyMap<number, DroneInfo>
}>()

defineEmits<{
	(e: 'ledChanged', droneId: number, color: ColorInfo): void
}>()

const toast = useToast()

const menu = ref<InstanceType<typeof ContextMenu>>()
const selected = reactive<number[]>([])

const sortMethod = ref<(a: DroneInfo, b: DroneInfo) => number>((a, b) => a.id - b.id)
const dronesSorted = computed(() => Array.from(props.drones.values()).sort(sortMethod.value))

function doHome(): void {
	// TODO
}

function doLand(): void {
	// TODO
}

function doDisarm(): void {
	// TODO
}

function doSleep(): void {
	// TODO
}

function doWakeup(): void {
	// TODO
}

function doControlLight(): void {
	// TODO
}

async function doCopyGPS(): Promise<void> {
	let data = ''
	let count = 0
	const drones = selected.length
		? (selected.map((id) => props.drones.get(id)).filter((d) => d !== undefined) as DroneInfo[])
		: dronesSorted.value
	for (const drone of drones.values()) {
		data += `{ id:${drone.id}, lat:${drone.gps?.lat}, lon:${drone.gps?.lon}, alt:${drone.gps?.alt}, typ:${drone.gpsType} }\n`
		count++
	}
	await navigator.clipboard.writeText(data)
	toast.add({
		severity: 'info',
		summary: 'GPS copied',
		detail: `Copied ${count} items`,
		life: 1000,
	})
}

const globalItems: MenuItem[] = [
	{ label: 'Home All', icon: 'pi pi-home', command: doHome },
	{ label: 'Land All', icon: 'pi pi-cloud-download', command: doLand },
	{ label: 'Disarm All', icon: 'pi pi-ban', command: doDisarm },
	{ label: 'Sleep All', icon: 'pi pi-moon', command: doSleep },
	{ label: 'Wakeup All', icon: 'pi pi-eye', command: doWakeup },
	{ label: 'Control All Lights', icon: 'pi pi-sliders-v', command: doControlLight },
	{ label: 'Copy All GPS', icon: 'pi pi-globe', command: doCopyGPS },
]

const individualItems: MenuItem[] = [
	{
		label: 'Actions',
		icon: 'pi pi-bars',
		items: [
			{ label: 'Home', icon: 'pi pi-home', command: doHome },
			{ label: 'Land', icon: 'pi pi-cloud-download', command: doLand },
			{ label: 'Disarm', icon: 'pi pi-ban', command: doDisarm },
		],
	},
	{ label: 'Sleep', icon: 'pi pi-moon', command: doSleep },
	{ label: 'Wakeup', icon: 'pi pi-eye', command: doWakeup },
	{ label: 'Control Lights', icon: 'pi pi-sliders-v', command: doControlLight },
	{ label: 'Copy GPS', icon: 'pi pi-globe', command: doCopyGPS },
]

const groupItems: MenuItem[] = [
	{
		label: 'Actions',
		icon: 'pi pi-bars',
		items: [
			{ label: 'Home Selected', icon: 'pi pi-home', command: doHome },
			{ label: 'Land Selected', icon: 'pi pi-cloud-download', command: doLand },
			{ label: 'Disarm Selected', icon: 'pi pi-ban', command: doDisarm },
		],
	},
	{ label: 'Sleep Selected', icon: 'pi pi-moon', command: doSleep },
	{ label: 'Wakeup Selected', icon: 'pi pi-eye', command: doWakeup },
	{ label: 'Control Selected Lights', icon: 'pi pi-sliders-v', command: doControlLight },
	{ label: 'Copy Selected GPS', icon: 'pi pi-globe', command: doCopyGPS },
]

const menuItems = ref(globalItems)

let lastClicked: number | null = null

function onClickDrone(event: PointerEvent, id?: number) {
	if ((event as any)._processed) {
		return
	}
	;(event as any)._processed = true
	menu.value?.hide()
	if (event.button !== 0) {
		return
	}
	if (id === undefined) {
		if (event.shiftKey) {
		} else if (!event.metaKey) {
			selected.splice(0)
			lastClicked = null
		}
		return
	}
	if (!event.metaKey) {
		selected.splice(0)
		if (!event.shiftKey || lastClicked === null) {
			selected.push(id)
		} else if (lastClicked !== id) {
			const lastIndex = dronesSorted.value.findIndex((d) => d.id === lastClicked)
			const curIndex = dronesSorted.value.findIndex((d) => d.id === id)
			const lowIndex = Math.min(curIndex, lastIndex)
			const highIndex = Math.max(curIndex, lastIndex)
			for (let i = lowIndex; i <= highIndex; i++) {
				selected.push(dronesSorted.value[i].id)
			}
		}
	} else {
		let i = selected.indexOf(id)
		if (i >= 0) {
			selected.splice(i, 1)
		} else {
			selected.push(id)
		}
	}
	lastClicked = id
}

function onContextMenu(event: PointerEvent, id?: number) {
	if (id === undefined) {
		if (selected.length === 1) {
			selected.splice(0)
		}
	} else {
		let i = selected.indexOf(id)
		if (i < 0) {
			selected.splice(0)
			selected.push(id)
		}
		lastClicked = id
	}
	switch (selected.length) {
		case 0:
			menuItems.value = globalItems
			break
		case 1:
			menuItems.value = individualItems
			break
		default:
			menuItems.value = groupItems
	}
	menu.value?.show(event)
}
</script>

<template>
	<Card class="card-overflow-hidden" @click="onClickDrone" @contextmenu.stop="onContextMenu">
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
					v-for="drone in dronesSorted"
					:key="drone.id"
					@click="onClickDrone($event, drone.id)"
					@contextmenu.stop="onContextMenu($event, drone.id)"
					class="drone"
					:drone="drone"
					:selected="selected.indexOf(drone.id) >= 0"
					@ledChanged="(color) => $emit('ledChanged', drone.id, color)"
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

.drone-list > * {
	flex-shrink: 0;
}

.drone-list-header {
	position: sticky;
	top: 0;
	z-index: 1;
	display: flex;
	flex-direction: row;
	align-items: center;
	width: 100%;
	height: 3rem;
	min-width: max-content;
	border-bottom: var(--p-surface-300) solid 2px;
	background-color: var(--p-card-background);
	font-weight: bold;
	font-family: 'Monaco', monospace;
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
	width: 18.5em;
}

.drone[selected='true'] {
	background-color: var(--p-contextmenu-item-focus-background);
}
</style>
