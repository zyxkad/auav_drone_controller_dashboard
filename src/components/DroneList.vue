<script setup lang="ts">
import { computed, ref, reactive, onMounted } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import ContextMenu from 'primevue/contextmenu'
import type { MenuItem } from 'primevue/menuitem'
import MultiSelect from 'primevue/multiselect'
import { useToast } from 'primevue/usetoast'
import DroneItem from './DroneItem.vue'
import { DroneAction, type ColorInfo, type DroneInfo } from '@/api'
import * as api from '@/api/instance'
import { FlightMode } from '@/data/ardupilot'

const props = defineProps<{
	drones: ReadonlyMap<number, DroneInfo>
}>()

defineEmits<{
	(e: 'ledChanged', droneId: number, color: ColorInfo): void
}>()

const toast = useToast()

const menu = ref<InstanceType<typeof ContextMenu>>()
const selected = reactive<number[]>([])

const filterSelectElem = ref()
const filterOptions = ['Status', 'Mode', 'Voltage', 'Current', 'Remaining', 'GPS Type', 'GPS', 'Relative Pos', 'Ping']
const selectedFilters = ref(Array.from(filterOptions))
const enabledColumns = {
	status: computed(() => selectedFilters.value.includes('Status')),
	mode: computed(() => selectedFilters.value.includes('Mode')),
	voltage: computed(() => selectedFilters.value.includes('Voltage')),
	current: computed(() => selectedFilters.value.includes('Current')),
	remaining: computed(() => selectedFilters.value.includes('Remaining')),
	'gps-type': computed(() => selectedFilters.value.includes('GPS Type')),
	gps: computed(() => selectedFilters.value.includes('GPS')),
	relpos: computed(() => selectedFilters.value.includes('Relative Pos')),
	ping: computed(() => selectedFilters.value.includes('Ping')),
}

const listElem = ref()
const listHeaderIdElem = ref()
const leftStucking = ref(false)

const sortMethod = ref<(a: DroneInfo, b: DroneInfo) => number>((a, b) => a.id - b.id)
const dronesSorted = computed(() => Array.from(props.drones.values()).sort(sortMethod.value))

async function doDroneAction(action: DroneAction): Promise<void> {
	const drones = selected.length === 0 ? null : Array.from(selected)
	if (drones !== null && drones.length === 0) {
		toast.add({
			severity: 'error',
			summary: 'Drone Action Failed',
			detail: 'No selected drones',
			life: 1500,
		})
		return
	}
	const resp = await api.requestDroneAction(action, drones)
	if (resp.ok) {
		toast.add({
			severity: resp.data.failed === 0 ? 'info' : 'warn',
			summary: 'Drone Action Requested',
			detail: `Requested ${resp.data.targets - resp.data.failed} / ${resp.data.targets} drones to ${action}`,
			life: 1000,
		})
		if (resp.data.failed > 0) {
			toast.add({
				severity: 'error',
				summary: 'Drone Action Failed',
				detail: resp.data.errors[0],
				life: 5000,
			})
		}
	} else {
		toast.add({
			severity: 'error',
			summary: 'Drone Action Failed',
			detail: resp.toString(),
			life: 4000,
		})
	}
}

async function doChangeMode(mode: FlightMode): Promise<void> {
	const drones = selected.length === 0 ? null : Array.from(selected)
	if (drones !== null && drones.length === 0) {
		toast.add({
			severity: 'error',
			summary: 'Mode Change Failed',
			detail: 'No selected drones',
			life: 1500,
		})
		return
	}
	const resp = await api.changeDroneMode(mode, drones)
	if (resp.ok) {
		toast.add({
			severity: resp.data.failed === 0 ? 'info' : 'warn',
			summary: 'Mode Change Successed',
			detail: `Changed ${resp.data.targets - resp.data.failed} / ${resp.data.targets} drones to ${mode}`,
			life: 1000,
		})
		if (resp.data.failed > 0) {
			toast.add({
				severity: 'error',
				summary: 'Mode Change Failed',
				detail: resp.data.errors[0],
				life: 5000,
			})
		}
	} else {
		toast.add({
			severity: 'error',
			summary: 'Mode Change Failed',
			detail: resp.toString(),
			life: 4000,
		})
	}
}

async function doControlLight(): Promise<void> {
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

const changeModeMenuItems: MenuItem[] = Object.values(FlightMode)
	.filter(Number.isInteger as (v: unknown) => v is FlightMode)
	.sort((a, b) => a - b)
	.map<MenuItem>((m) => ({ label: `(${m}) ${FlightMode[m]}`, command: () => doChangeMode(m) }))

const globalItems: MenuItem[] = [
	{
		label: 'Actions',
		icon: 'pi pi-bars',
		items: [
			{ label: 'Hold All', icon: 'pi pi-hourglass', command: () => doDroneAction(DroneAction.HOLD) },
			{ label: 'Home All', icon: 'pi pi-home', command: () => doDroneAction(DroneAction.HOME) },
			{
				label: 'Land All',
				disabled: true,
				icon: 'pi pi-cloud-download',
				command: () => doDroneAction(DroneAction.LAND),
			},
			{ label: 'Disarm All', icon: 'pi pi-ban', command: () => doDroneAction(DroneAction.DISARM) },
		],
	},
	{
		label: 'Change Mode All',
		icon: 'pi pi-hammer',
		class: 'change-mode-context-item',
		items: changeModeMenuItems,
	},
	{ label: 'Sleep All', icon: 'pi pi-moon', command: () => doDroneAction(DroneAction.SLEEP) },
	{ label: 'Wakeup All', icon: 'pi pi-eye', command: () => doDroneAction(DroneAction.WAKEUP) },
	{ label: 'Control All Lights', icon: 'pi pi-sliders-v', command: doControlLight },
	{ label: 'Copy All GPS', icon: 'pi pi-globe', command: doCopyGPS },
]

const individualItems: MenuItem[] = [
	{
		label: 'Actions',
		icon: 'pi pi-bars',
		items: [
			{ label: 'Hold', icon: 'pi pi-hourglass', command: () => doDroneAction(DroneAction.HOLD) },
			{ label: 'Home', icon: 'pi pi-home', command: () => doDroneAction(DroneAction.HOME) },
			{ label: 'Land', icon: 'pi pi-cloud-download', command: () => doDroneAction(DroneAction.LAND) },
			{ label: 'Disarm', icon: 'pi pi-ban', command: () => doDroneAction(DroneAction.DISARM) },
		],
	},
	{
		label: 'Change Mode',
		icon: 'pi pi-hammer',
		class: 'change-mode-context-item',
		items: changeModeMenuItems,
	},
	{ label: 'Sleep', icon: 'pi pi-moon', command: () => doDroneAction(DroneAction.SLEEP) },
	{ label: 'Wakeup', icon: 'pi pi-eye', command: () => doDroneAction(DroneAction.WAKEUP) },
	{ label: 'Control Lights', icon: 'pi pi-sliders-v', command: doControlLight },
	{ label: 'Copy GPS', icon: 'pi pi-globe', command: doCopyGPS },
]

const groupItems: MenuItem[] = [
	{
		label: 'Actions',
		icon: 'pi pi-bars',
		items: [
			{ label: 'Hold Selected', icon: 'pi pi-hourglass', command: () => doDroneAction(DroneAction.HOLD) },
			{ label: 'Home Selected', icon: 'pi pi-home', command: () => doDroneAction(DroneAction.HOME) },
			{
				label: 'Land Selected',
				disabled: true,
				icon: 'pi pi-cloud-download',
				command: () => doDroneAction(DroneAction.LAND),
			},
			{ label: 'Disarm Selected', icon: 'pi pi-ban', command: () => doDroneAction(DroneAction.DISARM) },
		],
	},
	{
		label: 'Change Mode Selected',
		icon: 'pi pi-hammer',
		class: 'change-mode-context-item',
		items: changeModeMenuItems,
	},
	{ label: 'Sleep Selected', icon: 'pi pi-moon', command: () => doDroneAction(DroneAction.SLEEP) },
	{ label: 'Wakeup Selected', icon: 'pi pi-eye', command: () => doDroneAction(DroneAction.WAKEUP) },
	{ label: 'Control Selected Lights', icon: 'pi pi-sliders-v', command: doControlLight },
	{ label: 'Copy Selected GPS', icon: 'pi pi-globe', command: doCopyGPS },
]

const menuItems = ref(globalItems)

let lastSelected: number | null = null

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
			lastSelected = null
		}
		return
	}
	if (!event.metaKey) {
		selected.splice(0)
		if (!event.shiftKey || lastSelected === null) {
			selected.push(id)
		} else if (lastSelected !== id) {
			const lastIndex = dronesSorted.value.findIndex((d) => d.id === lastSelected)
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
	lastSelected = id
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
		lastSelected = id
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

onMounted(() => {
	const observer = new IntersectionObserver(
		([{ isIntersecting }]) => {
			leftStucking.value = !isIntersecting
		},
		{
			root: listElem.value,
			rootMargin: '0px',
			threshold: 1,
		},
	)
	observer.observe(listHeaderIdElem.value)
})
</script>

<template>
	<Card class="card-overflow-hidden" @click="onClickDrone" @contextmenu.stop="onContextMenu">
		<template #title>
			<h3 class="no-select no-margin inline-block">Drones</h3>
			<Button
				text
				rounded
				severity="secondary"
				icon="pi pi-filter"
				style="margin-left: 0.3em"
				@click="filterSelectElem.$el.click($event)"
			/>
			<MultiSelect
				ref="filterSelectElem"
				class="not-visible"
				:showToggleAll="false"
				scrollHeight="14.5rem"
				v-model="selectedFilters"
				:options="filterOptions"
			>
				<template #option="slotProps">
					{{ slotProps.option }}
				</template>
			</MultiSelect>
		</template>
		<template #content>
			<div
				ref="listElem"
				class="no-select drone-list"
				:class="{
					'left-bar-stucking': leftStucking,
					'status-hide': !enabledColumns.status.value,
					'mode-hide': !enabledColumns.mode.value,
					'voltage-hide': !enabledColumns.voltage.value,
					'current-hide': !enabledColumns.current.value,
					'remaining-hide': !enabledColumns.remaining.value,
					'gps-type-hide': !enabledColumns['gps-type'].value,
					'gps-hide': !enabledColumns.gps.value,
					'relpos-hide': !enabledColumns.relpos.value,
					'ping-hide': !enabledColumns.ping.value,
				}"
			>
				<!-- TODO: width animation when filter changed -->
				<div class="drone-list-header">
					<div ref="listHeaderIdElem" class="id">ID</div>
					<div class="status">STATUS</div>
					<div class="mode">MODE</div>
					<div class="voltage">VOLTAGE</div>
					<div class="current">CURRENT</div>
					<div class="remaining">POWER</div>
					<div class="gps-type">GPS_TYPE</div>
					<div class="gps">GPS - (LAT, LON, ALT)</div>
					<div class="relpos">[EAST, NORTH, HEIGHT]</div>
					<div class="ping">PING</div>
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
	white-space: nowrap;
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
	line-height: 3rem;
	min-width: max-content;
	border-bottom: var(--p-surface-300) solid 2px;
	background-color: var(--p-card-background);
	font-weight: bold;
	font-family: 'Monaco', monospace;
}

.drone-list-header > * {
	height: 100%;
	flex-shrink: 0;
	margin-right: 0.5em;
}

.id {
	position: sticky;
	left: -1px;
	box-sizing: content-box;
	width: 4.2em;
	padding-right: 0.6em;
	text-align: right;
	margin-right: 0.4em;
	border-right: #0000 solid 1px;
	background-color: var(--p-card-background);
}

.left-bar-stucking .id {
	border-right-color: var(--p-surface-300);
}

.status {
	width: 5em;
}
.mode {
	width: 5.5em;
}
.voltage,
.current {
	width: 4.2em;
}
.remaining {
	width: 3.5em;
}
.gps-type {
	width: 5.5em;
}
.gps {
	width: 18.5em;
}
.relpos {
	width: 15em;
}
.ping {
	width: 4.2em;
}

.status-hide :deep(.status) {
	display: none;
}
.mode-hide :deep(.mode) {
	display: none;
}
.voltage-hide :deep(.voltage) {
	display: none;
}
.current-hide :deep(.current) {
	display: none;
}
.remaining-hide :deep(.remaining) {
	display: none;
}
.gps-type-hide :deep(.gps-type) {
	display: none;
}
.gps-hide :deep(.gps) {
	display: none;
}
.relpos-hide :deep(.relpos) {
	display: none;
}
.ping-hide :deep(.ping) {
	display: none;
}

.drone[selected='true'] {
	background-color: var(--p-contextmenu-item-focus-background);
}
</style>

<style>
.change-mode-context-item > .p-contextmenu-submenu {
	max-height: 12.5rem;
	overflow-y: auto;
	font-size: 0.9em;
	font-family: monospace;
	white-space: nowrap;
}
</style>
