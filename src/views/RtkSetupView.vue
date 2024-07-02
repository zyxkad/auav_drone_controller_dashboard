<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import InputSwitch from 'primevue/inputswitch'
import { useToast } from 'primevue/usetoast'
import * as api from '@/api/instance'
import type { Device, RTKConfig } from '@/api'

const toast = useToast()

const rtkConfig = reactive({
	device: 0,
	baudRate: 9600,
	surveyIn: true,
	surveyInDur: 60,
	surveyInAcc: 10,
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
	await api.connectRtkPort({
		device: device.name,
		baudRate: rtkConfig.baudRate,
		surveyIn: rtkConfig.surveyIn,
		surveyInDur: rtkConfig.surveyInDur,
		surveyInAcc: rtkConfig.surveyInAcc,
	})
	submitting.value = false
}

onMounted(() => {
	api.getAvaliableDevices().then((devices) => {
		avaliableDevices.value = devices
	})
})
</script>

<template>
	<Card class="setup-card">
		<template #title>
			Setup RTK
		</template>
		<template #content>
			<form v-focustrap @submit.prevent="submitRTKSetup">
				<div class="option-box">
					<label>Decive</label>
					<Dropdown
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
								{{ avaliableDevices[slotProps.value].name }} ({{
									avaliableDevices[slotProps.value].description
								}})
							</template>
						</template>
						<template #option="slotProps" v-if="avaliableDevices !== null">
							{{ avaliableDevices[slotProps.option].name }} ({{
								avaliableDevices[slotProps.option].description
							}})
						</template>
					</Dropdown>
				</div>
				<div class="option-box">
					<label>BaudRate</label>
					<Dropdown
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
					</Dropdown>
				</div>
				<div class="option-box">
					<label>Survey-In</label>
					<InputSwitch
						v-model="rtkConfig.surveyIn"
					/>
				</div>
				<div class="option-box">
					<label>SVIN Duration</label>
					<InputNumber
						:disabled="!rtkConfig.surveyIn"
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
						v-model="rtkConfig.surveyInAcc"
						placeholder="Survey-In Accuracy"
						suffix="m"
						:minFractionDigits="1"
						:maxFractionDigits="4"
					/>
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
	height: 30rem;
	transform: translate(-50%, -50%);
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

.button-box {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	width: 100%;
	height: 3rem;
}

</style>
