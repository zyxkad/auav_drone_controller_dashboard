<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Select from 'primevue/select'
import { useToast } from 'primevue/usetoast'
import * as api from '@/api/instance'
import { RespStatus, type Device, type LoraConfig } from '@/api'

const props = defineProps<{
	nextURL?: string
}>()

const router = useRouter()
const toast = useToast()

const loraConfig = reactive({
	device: 0,
	baudRate: 115200,
})

const avaliableDevices = ref<Device[] | null>(null)
const avaliableBaudRates = [4800, 9600, 19200, 38400, 57600, 115200, 230400, 460800, 921600]
const submitting = ref(false)

async function submitLoraSetup(): Promise<void> {
	if (avaliableDevices.value === null) {
		return
	}
	const device = avaliableDevices.value[loraConfig.device]
	if (!device) {
		return
	}
	submitting.value = true
	const res = await api.connectLoraPort({
		device: device.name,
		baudRate: loraConfig.baudRate,
	})
	submitting.value = false
	if (res === RespStatus.OK) {
		router.push(props.nextURL || '/')
	}
}

onMounted(() => {
	api.getAvaliableDevices().then((devices) => {
		avaliableDevices.value = devices
	})
})
</script>

<template>
	<Card class="setup-card">
		<template #title> Setup Lora </template>
		<template #content>
			<form v-focustrap @submit.prevent="submitLoraSetup">
				<div class="option-box">
					<label>Decive</label>
					<Select
						class="option-input"
						v-model="loraConfig.device"
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
					</Select>
				</div>
				<div class="option-box">
					<label>BaudRate</label>
					<Select
						class="option-input"
						v-model="loraConfig.baudRate"
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
				<div class="button-box">
					<Button type="submit" label="Submit" :loading="submitting" />
					<RouterLink :to="nextURL || '/'">
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
