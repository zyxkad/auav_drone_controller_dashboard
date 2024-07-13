<script setup lang="ts">
import { ref, reactive, readonly, onBeforeMount } from 'vue'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputNumber from 'primevue/inputnumber'
import type { DirectorPos } from '@/api'

const visible = ref(false)
const origin = reactive<DirectorPos>({
	latitude: 0,
	longitude: 0,
	altitude: 0,
	heading: 0,
})
const submitting = ref(false)

async function onSubmit(): Promise<void> {
	submitting.value = true
	try {
		// await submitDirectorPos(origin)
	} finally {
		submitting.value = false
	}
}

function open(): void {
	visible.value = true
}

defineExpose({
	open,
})
</script>

<template>
	<Dialog v-model:visible="visible" style="box-shadow: #000 0px 0px 15px 1px" position="right" header="Director Setup">
		<form class="director-dialog" @submit.prevent="onSubmit">
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
				<label>Altitude</label>
				<InputNumber
					:disabled="true"
					class="option-input"
					v-model="origin.altitude"
					placeholder="Altitude"
					suffix="m"
					:minFractionDigits="3"
					:maxFractionDigits="3"
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
					:maxFractionDigits="1"
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
	justify-content: space-between;
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
