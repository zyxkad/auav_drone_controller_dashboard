<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRequest } from 'vue-request'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import type { DirectorStatus } from '@/api'
import * as api from '@/api/v1'

const props = defineProps<{
	avaliableDrones: number[]
}>()

const emit = defineEmits<{
	(e: 'destroyed'): void
}>()

const toast = useToast()

const selectedDrone = ref<number | string>()
const requesting = ref(false)
const destroyConfirmVisible = ref(false)

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
const idling = computed(() => !status.value.status)

async function onAssign(): Promise<void> {
	const droneId = parseInt(selectedDrone.value)
	if (!droneId) {
		toast.add({
			severity: 'error',
			summary: 'Assign Failed',
			detail: 'Need select a valid drone',
			life: 5000,
		})
		return
	}
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
			<div v-if="idling" class="button">
				<Button
					class="button-m10-1"
					:loading="requesting"
					label="Assign"
					icon="pi pi-address-book"
					@click="onAssign"
				/>
				<Select v-model="selectedDrone" editable :options="avaliableDrones" placeholder="Select a drone" />
			</div>
			<template v-else>
				<!-- TODO: define a status enum -->
				<div class="button">
					<Button
						:loading="requesting"
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
						label="Transfer"
						icon="pi pi-upload"
						severity="warn"
						fluid
						@click="onTransfer"
					/>
				</div>
				<div class="button">
					<Button label="Cancel" icon="pi pi-times" severity="danger" outlined fluid @click="onCancel" />
				</div>
			</template>
		</template>
	</Dialog>
	<Dialog v-model:visible="destroyConfirmVisible" header="Are you sure to destroy the director?">
		<div style="margin-top: 0.5rem">
			<Button
				class="button-m10-1"
				label="Destroy"
				icon="pi pi-times"
				severity="danger"
				outlined
				@click="onDestroy"
			/>
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
	width: min(40rem, 90vw);
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
