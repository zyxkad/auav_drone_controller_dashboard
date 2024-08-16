<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRequest } from 'vue-request'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import type { DroneInfo, DirectorStatus } from '@/api'
import { DroneStatus } from '@/api'
import * as api from '@/api/v1'

const props = defineProps<{
	drones: ReadonlyMap<number, DroneInfo>
}>()

const emit = defineEmits<{
	(e: 'destroyed'): void
}>()

const toast = useToast()

const automated = ref(0)
const requesting = ref(false)
const destroyConfirmVisible = ref(false)
const selectedDrone = ref<number | string>()
const assignedDrones = reactive<number[]>([])

const avaliableDrones = computed(() => {
	const avaliables = []
	for (const drone of props.drones.values()) {
		if (drone.status === DroneStatus.READY) {
			if (!assignedDrones.includes(drone.id)) {
				avaliables.push(drone.id)
			}
		}
	}
	avaliables.sort()
	return avaliables
})

const { data } = useRequest(async () => (await api.pollDirector()).asData(), {
	pollingInterval: 500,
	pollingWhenOffline: true,
})
const status = computed<DirectorStatus>(
	() =>
		data.value || {
			status: '',
			log: '',
			assigning: 0,
			ready: false,
			assigned: 0,
			total: 0,
		},
)
const idling = computed(() => status.value.assigning <= 0)

async function onAssign(): Promise<void> {
	const droneId = parseInt(selectedDrone.value as any)
	if (!droneId) {
		toast.add({
			severity: 'error',
			summary: 'Assign Failed',
			detail: 'Need select a valid drone',
			life: 5000,
		})
		return
	}
	return await assignDrone(droneId)
}

async function assignDrone(droneId: number): Promise<void> {
	if (requesting.value) {
		toast.add({
			severity: 'warn',
			summary: 'Request In Progress',
			life: 2000,
		})
		return
	}
	requesting.value = true
	try {
		const res = await api.assignDirector(droneId)
		if (res.ok) {
			toast.add({
				severity: 'info',
				summary: 'Assign Successed',
				life: 1500,
			})
			return
		}
		toast.add({
			severity: 'error',
			summary: 'Assign Failed',
			detail: res.toString(),
			life: 5000,
		})
	} finally {
		requesting.value = false
	}
}

const INTERRUPT_ERROR = new Error('Automate operate canceled')

async function onAutomatedAssign(): Promise<void> {
	if (automated.value) {
		return
	}
	automated.value = 1
	try {
		await onAutomatedAssign0()
	} catch (e) {
		if (e !== INTERRUPT_ERROR) {
			throw e
		}
	} finally {
		automated.value = 0
	}
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

async function sleepOrInterrupt(ms: number): Promise<void> {
	const CHECK_INTERVAL = 500
	const c = Math.floor(ms / CHECK_INTERVAL)
	const r = ms - c * CHECK_INTERVAL
	for (let i = 0; i < c; i++) {
		await sleep(CHECK_INTERVAL)
		if (automated.value !== 1) {
			throw INTERRUPT_ERROR
		}
	}
	await sleep(r)
	if (automated.value !== 1) {
		throw INTERRUPT_ERROR
	}
}

async function onAutomatedAssign0(): Promise<void> {
	if (status.value.assigned >= status.value.total) {
		toast.add({
			severity: 'warn',
			summary: 'Automate Init Failed',
			detail: 'No empty slot left to assign',
			life: 3000,
		})
		return
	}
	const getStatus = () => status.value.status
	assignedDrones.length = 0
	while (status.value.assigned < status.value.total) {
		if (status.value.assigned != assignedDrones.length) {
			toast.add({
				severity: 'error',
				summary: 'Automate Failed',
				detail: 'Status not match',
				life: 30000,
			})
			return
		}
		while (!avaliableDrones.value.length) {
			console.log('[automata]: Waiting for avaliableDrones')
			await sleepOrInterrupt(1000)
		}
		const next = avaliableDrones.value[0]
		console.log(`[automata]: Assigning ${next}`)
		await assignDrone(next)
		await sleepOrInterrupt(3000)
		await onCheck()
		console.log(`[automata]: Waiting until check complete for ${next}`)
		while (true) {
			await sleepOrInterrupt(1000)
			if (getStatus() !== 'Checking') {
				if (getStatus() === 'Check.Successed') {
					break
				}
				console.log(`[automata]: Check failed for ${next}, schedule again after 3s`)
				await sleepOrInterrupt(3000)
				await onCheck()
			}
		}
		await onTransfer()
		console.log(`[automata]: Waiting until ${next} transfered`)
		while (true) {
			await sleepOrInterrupt(1000)
			if (getStatus() !== 'Transfering') {
				if (getStatus() === 'Transfer.Successed') {
					break
				}
				console.log(`[automata]: Drone ${next} transfer failed`)
				return
			}
		}
	}
}

async function onCancelAutomate(): Promise<void> {
	if (automated.value !== 0) {
		automated.value = -1
	}
	return await onCancel()
}

async function onCheck(): Promise<void> {
	if (requesting.value) {
		toast.add({
			severity: 'warn',
			summary: 'Request In Progress',
			life: 2000,
		})
		return
	}
	requesting.value = true
	try {
		const res = await api.directorCheckAssign()
		if (res.ok) {
			toast.add({
				severity: 'info',
				summary: 'Cheak Request Successed',
				life: 1500,
			})
			return
		}
		toast.add({
			severity: 'error',
			summary: 'Cheak Failed',
			detail: res.toString(),
			life: 5000,
		})
	} finally {
		requesting.value = false
	}
}

async function onTransfer(): Promise<void> {
	if (requesting.value) {
		toast.add({
			severity: 'warn',
			summary: 'Request In Progress',
			life: 2000,
		})
		return
	}
	requesting.value = true
	try {
		const res = await api.directorTransferAssign()
		if (res.ok) {
			toast.add({
				severity: 'info',
				summary: 'Transfer Request Successed',
				life: 1500,
			})
			return
		}
		toast.add({
			severity: 'error',
			summary: 'Transfer Failed',
			detail: res.toString(),
			life: 5000,
		})
	} finally {
		requesting.value = false
	}
}

async function onCancel(): Promise<void> {
	const res = await api.directorCancelAssign()
	if (res.ok) {
		toast.add({
			severity: 'info',
			summary: 'Cancel Successed',
			life: 1500,
		})
		return
	}
	toast.add({
		severity: 'error',
		summary: 'Cancel Failed',
		detail: res.toString(),
		life: 5000,
	})
}

async function onDestroy(): Promise<void> {
	onCancelAutomate()
	destroyConfirmVisible.value = false
	const res = await api.destroyDirector()
	if (res.ok) {
		toast.add({
			severity: 'info',
			summary: 'Director Destroyed',
			life: 1500,
		})
		emit('destroyed')
		return
	}
	toast.add({
		severity: 'error',
		summary: 'Director Destroy Failed',
		detail: res.toString(),
		life: 5000,
	})
}
</script>

<template>
	<Dialog
		:visible="true"
		@update:visible="
			(v) => {
				if (!v) {
					destroyConfirmVisible = true
				}
			}
		"
		header="Director Controller"
	>
		<template #default>
			<div class="status-line">
				<label>Status</label>
				<span>{{ status.status || 'Idle' }}</span>
			</div>
			<div class="status-line">
				<label>Assigning</label>
				<span>{{ status.assigning > 0 ? status.assigning : 'N/A' }}</span>
			</div>
			<div class="status-line">
				<label>Slots</label>
				<span>{{ status.assigned }} / {{ status.total }}</span>
			</div>
			<code class="log-block">
				{{ status.log }}
			</code>
			<div v-if="idling">
				<div v-if="!automated" class="button flex-row-center">
					<Button
						class="button-m10-1"
						:loading="requesting"
						label="Assign"
						icon="pi pi-address-book"
						@click="onAssign"
					/>
					<Select
						v-model="selectedDrone"
						editable
						:options="avaliableDrones"
						placeholder="Select a drone"
						style="width: 10rem; height: 2.3rem"
					/>
				</div>
				<div class="button">
					<Button
						v-if="!automated"
						label="Automated Assign"
						icon="pi pi-graduation-cap"
						severity="help"
						@click="onAutomatedAssign"
						style="width: 21rem"
					/>
				</div>
			</div>
			<template v-else>
				<!-- TODO: define a status enum -->
				<div class="button">
					<Button
						:loading="requesting"
						:disabled="automated"
						label="Check"
						icon="pi pi-pen-to-square"
						severity="success"
						fluid
						@click="onCheck"
					/>
				</div>
				<div v-if="status.ready" class="button">
					<Button
						:loading="requesting"
						:disabled="automated"
						label="Transfer"
						icon="pi pi-upload"
						severity="warn"
						fluid
						@click="onTransfer"
					/>
				</div>
				<div class="button">
					<Button
						label="Cancel"
						icon="pi pi-times"
						severity="danger"
						outlined
						fluid
						:disabled="automated"
						@click="onCancel"
					/>
				</div>
			</template>
			<div class="button">
				<Button
					v-if="automated"
					label="Cancel Automate"
					icon="pi pi-times"
					severity="contrast"
					fluid
					@click="onCancelAutomate"
				/>
			</div>
		</template>
	</Dialog>
	<Dialog v-model:visible="destroyConfirmVisible" header="Are you sure to destroy the director?">
		<div style="margin-top: 0.5rem">
			<Button class="button-m10-1" label="Destroy" icon="pi pi-times" severity="danger" outlined @click="onDestroy" />
			<Button
				label="Cancel"
				icon="pi pi-times"
				severity="warn"
				style="width: 10rem"
				@click="destroyConfirmVisible = false"
			/>
		</div>
	</Dialog>
</template>

<style scoped>
.status-line {
	display: flex;
	flex-direction: row;
}

.status-line > label {
	display: inline-block;
	width: 7rem;
	font-weight: bold;
}

.log-block {
	display: block;
	width: min(41rem, 90vw);
	margin-top: 1rem;
}

.button {
	margin-top: 0.7rem;
}

.button-m10-1 {
	width: 10rem;
	margin-right: 1rem;
}
</style>
