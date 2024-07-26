<script setup lang="ts">
import { ref, reactive, readonly, onBeforeMount } from 'vue'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import FileUpload from 'primevue/fileupload'
import type { FileUploadUploaderEvent } from 'primevue/fileupload'
import JSZip from 'jszip'
import * as api from '@/api/v1'

const emit = defineEmits<{
	(e: 'setup'): void
}>()

const toast = useToast()

const visible = ref(false)
const uploadedFileName = ref<string | null>(null)
var points: number[][] | null = null
const origin = reactive({
	latitude: 0,
	longitude: 0,
	altitude: 0,
	height: 2,
	heading: 0,
})
const submitting = ref(false)

function open(): void {
	visible.value = true
	points = null
	uploadedFileName.value = null
}

interface ShowDroneData {
	type: string
	settings: {
		name: string
		home: number[]
		landAt: number[]
		trajectory: { points: number[] } | { $ref: string }
	}
}

async function onProgramUpload(event: FileUploadUploaderEvent): Promise<void> {
	points = null
	const file = Array.isArray(event.files) ? event.files[0] : event.files
	uploadedFileName.value = file.name
	const zip = new JSZip()
	let data: any
	try {
		await zip.loadAsync(file)
		const f = zip.file('show.json')
		if (!f) {
			throw new Error('Invalid program file, show.json not exists')
		}
		const content = await f.async('string')
		data = JSON.parse(content)
	} catch (err) {
		toast.add({
			severity: 'error',
			summary: 'Cannot open show file',
			detail: String(err),
			life: 7000,
		})
		return
	}
	if (data.version !== 1) {
		console.error(`Unsupported show file version ${data.version}`)
		return
	}
	const drones = data.swarm.drones as ShowDroneData[]
	points = drones.map(({ settings: { home } }) => home)
}

async function onSubmit(): Promise<void> {
	submitting.value = true
	try {
		if (!points) {
			toast.add({
				severity: 'error',
				summary: 'No Points Provided',
				detail: 'Program file is not uploaded, or the points set is empty',
				life: 5000,
			})
			return
		}
		const res = await api.initDirector(
			{
				lat: origin.latitude,
				lon: origin.longitude,
				alt: origin.altitude,
			},
			points,
			origin.heading,
			origin.height,
		)
		if (res.ok) {
			toast.add({
				severity: 'info',
				summary: 'Director Setup Successed',
				life: 1500,
			})
			visible.value = false
			emit('setup')
			return
		}
		toast.add({
			severity: 'error',
			summary: 'Cannot setup Director',
			detail: res.toString(),
			life: 5000,
		})
	} finally {
		submitting.value = false
	}
}

defineExpose({
	open,
})
</script>

<template>
	<Dialog v-model:visible="visible" style="box-shadow: #000 0px 0px 15px 1px" position="right" header="Director Setup">
		<form class="director-dialog" @submit.prevent="onSubmit">
			<div class="option-box">
				<label>Program File</label>
				<FileUpload mode="basic" accept=".skyc" auto customUpload @uploader="onProgramUpload" />
				<span v-if="uploadedFileName" style="margin-left: 0.5rem">{{ uploadedFileName }}</span>
			</div>
			<div class="option-box">
				<label>Latitude</label>
				<InputNumber
					class="option-input"
					v-model="origin.latitude"
					placeholder="Latitude"
					suffix="&deg;"
					:min="-90"
					:max="90"
					:minFractionDigits="7"
					:maxFractionDigits="7"
				/>
			</div>
			<div class="option-box">
				<label>Longitude</label>
				<InputNumber
					class="option-input"
					v-model="origin.longitude"
					placeholder="Longitude"
					suffix="&deg;"
					:min="-180"
					:max="180"
					:minFractionDigits="7"
					:maxFractionDigits="7"
				/>
			</div>
			<div class="option-box">
				<label>Heading</label>
				<InputNumber
					class="option-input"
					v-model="origin.heading"
					placeholder="Heading"
					suffix="&deg;"
					:min="-360"
					:max="360"
					:minFractionDigits="1"
					:maxFractionDigits="2"
				/>
			</div>
			<div class="option-box">
				<label>Height</label>
				<InputNumber
					class="option-input"
					v-model="origin.height"
					placeholder="Height"
					suffix="m"
					:minFractionDigits="3"
					:maxFractionDigits="3"
				/>
			</div>
			<Button type="submit" label="Submit" :loading="submitting" fluid />
		</form>
	</Dialog>
</template>

<style scoped>
.director-dialog {
	display: flex;
	flex-direction: column;
}

.option-box {
	display: flex;
	flex-direction: row;
	align-items: center;
	width: 100%;
	height: 3rem;
	margin-bottom: 1rem;
}

.option-box > label {
	display: inline-block;
	width: 8rem;
	font-weight: 500;
}

.option-input {
	width: 14rem;
}
</style>
