<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Select from 'primevue/select'
import InputNumber from 'primevue/inputnumber'
import ToggleSwitch from 'primevue/toggleswitch'
import { useToast } from 'primevue/usetoast'
import TransitionExpand from '@/components/TransitionExpand.vue'
import * as api from '@/api/instance'
import type { RespStatus, Device, RTKConfig } from '@/api'

const props = defineProps<{
	nextURL?: string
}>()

const emit = defineEmits<{
	(e: 'rtk-bind'): void
}>()

const router = useRouter()
const toast = useToast()

const rtkConfig = reactive({
	device: 0,
	baudRate: 9600,
	surveyIn: true,
	surveyInDur: 60,
	surveyInAcc: 1,
})

const avaliableDevices = ref<Device[] | null>(null)
const avaliableBaudRates = [4800, 9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600]
const submitting = ref(false)

async function submitRTKSetup(): Promise<void> {
	if (avaliableDevices.value === null) {
		return
	}
	const device = avaliableDevices.value[rtkConfig.device]
	if (!device) {
		return
	}
	submitting.value = true
	const res = await api.connectRtkPort({
		device: device.name,
		baudRate: rtkConfig.baudRate,
		surveyIn: rtkConfig.surveyIn,
		surveyInDur: rtkConfig.surveyInDur,
		surveyInAcc: rtkConfig.surveyInAcc,
	})
	submitting.value = false
	if (res.ok) {
		emit('rtk-bind')
		router.push(props.nextURL || '/')
		return
	}
	toast.add({
		severity: 'error',
		summary: 'Cannot setup RTK',
		detail: res.toString(),
		life: 5000,
	})
}

onMounted(() => {
	Promise.all([
		api.connectedRtkPort().then((config) => {
			if (config) {
				rtkConfig.baudRate = config.baudRate
				rtkConfig.surveyIn = config.surveyIn
				rtkConfig.surveyInDur = config.surveyInDur
				rtkConfig.surveyInAcc = config.surveyInAcc
			}
			return config
		}),
		api.getAvaliableDevices().then((devices) => {
			avaliableDevices.value = devices
		}),
	]).then(([config]) => {
		if (config && avaliableDevices.value) {
			const i = avaliableDevices.value.findIndex(({ name }) => name === config.device)
			if (i >= 0) {
				rtkConfig.device = i
			}
		}
	})
})
</script>

<template>
	<Card class="setup-card">
		<template #title>Setup RTK</template>
		<template #content>
			<form v-focustrap @submit.prevent="submitRTKSetup">
				<div class="option-box">
					<label>Decive</label>
					<Select
						class="option-input"
						v-model="rtkConfig.device"
						:options="
							avaliableDevices === null
								? ['Loading ...']
								: Array(avaliableDevices.length)
										.fill(0)
										.map((_, i) => i)
						"
						placeholder="Device"
					>
						<template #value="slotProps">
							<template v-if="avaliableDevices === null"> Loading ... </template>
							<template v-else>
								{{ avaliableDevices[slotProps.value].name
								}}<span v-if="avaliableDevices[slotProps.value].description">
									({{ avaliableDevices[slotProps.value].description }})</span
								>
							</template>
						</template>
						<template #option="slotProps" v-if="avaliableDevices !== null">
							{{ avaliableDevices[slotProps.option].name
							}}<span v-if="avaliableDevices[slotProps.option].description">
								({{ avaliableDevices[slotProps.option].description }})</span
							>
						</template>
					</Select>
				</div>
				<div class="option-box">
					<label>BaudRate</label>
					<Select
						class="option-input"
						v-model="rtkConfig.baudRate"
						:options="avaliableBaudRates"
						placeholder="BaudRate"
					>
						<template #value="slotProps">
							{{ slotProps.value }}
						</template>
						<template #option="slotProps">
							{{ slotProps.option }}
						</template>
					</Select>
				</div>
				<div class="option-box">
					<label>Survey-In</label>
					<ToggleSwitch v-model="rtkConfig.surveyIn" />
				</div>
				<TransitionExpand>
					<div v-show="rtkConfig.surveyIn">
						<div class="option-box">
							<label>SVIN Duration</label>
							<InputNumber
								:disabled="!rtkConfig.surveyIn"
								class="option-input"
								v-model="rtkConfig.surveyInDur"
								placeholder="Survey-In Duration"
								suffix="s"
								:min="0"
							/>
						</div>
						<div class="option-box">
							<label>SVIN Accuracy</label>
							<InputNumber
								:disabled="!rtkConfig.surveyIn"
								class="option-input"
								v-model="rtkConfig.surveyInAcc"
								placeholder="Survey-In Accuracy"
								suffix="m"
								:minFractionDigits="1"
								:maxFractionDigits="4"
							/>
						</div>
					</div>
				</TransitionExpand>
				<div>
					<RouterLink to="/setup/satellite">Setup Satellite</RouterLink>
				</div>
				<div class="button-box">
					<Button type="submit" label="Submit" :loading="submitting" />
					<RouterLink to="/">
						<Button link label="Skip" icon="pi pi-arrow-right" />
					</RouterLink>
				</div>
			</form>
		</template>
	</Card>
</template>

<style scoped>
.setup-card {
	position: absolute;
	top: 50%;
	left: 50%;
	width: 25rem;
	transform: translate(-50%, -50%);
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

.button-box {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	height: 3rem;
}
</style>
