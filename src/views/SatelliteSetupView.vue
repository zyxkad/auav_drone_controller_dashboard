<script setup lang="ts">
import { ref, reactive, onBeforeMount } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Select from 'primevue/select'
import InputNumber from 'primevue/inputnumber'
import ToggleSwitch from 'primevue/toggleswitch'
import { useToast } from 'primevue/usetoast'
import TransitionExpand from '@/components/TransitionExpand.vue'
import * as api from '@/api/instance'
import { RespStatus, type Device, type SatelliteConfig } from '@/api'

const props = defineProps<{
	nextURL?: string
}>()

const router = useRouter()
const toast = useToast()

const satelliteConfig = reactive<SatelliteConfig>({
	GPS: true,
	GLONASS: true,
	Galileo: true,
	BeiDou: true,
	PVT: false,
})

const submitting = ref(false)

async function submitSatelliteSetup(): Promise<void> {
	submitting.value = true
	const res = await api.updateSatelliteConfig(satelliteConfig)
	submitting.value = false
	if (res === RespStatus.OK) {
		router.push(props.nextURL || '/')
	}
}

onBeforeMount(async () => {
	await api.getSatelliteConfig().then((devices) => {
		Object.assign(satelliteConfig, devices)
	})
})
</script>

<template>
	<Card class="setup-card">
		<template #title>Setup Satellites</template>
		<template #content>
			<form v-focustrap @submit.prevent="submitSatelliteSetup">
				<div class="option-box">
					<label>GPS</label>
					<ToggleSwitch v-model="satelliteConfig.GPS" />
				</div>
				<div class="option-box">
					<label>GLONASS</label>
					<ToggleSwitch v-model="satelliteConfig.GLONASS" />
				</div>
				<div class="option-box">
					<label>Galileo</label>
					<ToggleSwitch v-model="satelliteConfig.Galileo" />
				</div>
				<div class="option-box">
					<label>BeiDou</label>
					<ToggleSwitch v-model="satelliteConfig.BeiDou" />
				</div>
				<div class="option-box">
					<label>PVT</label>
					<ToggleSwitch v-model="satelliteConfig.PVT" />
				</div>
				<div class="button-box">
					<Button type="submit" label="Update" :loading="submitting" />
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
