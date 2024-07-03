<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSetupProcessStore } from '@/stores/setup'
import LogBlock from '@/components/LogBlock.vue'
import RtkStatus from '@/components/RtkStatus.vue'
import * as api from '@/api/instance'

const router = useRouter()
const setupProcess = useSetupProcessStore()

const logBlk = ref<InstanceType<typeof LogBlock>>()

onMounted(() => {
	let redirectPath = ''
	const { lora: isLoraSetted, rtk: isRtkSetted } = setupProcess
	if (!isRtkSetted) {
		redirectPath = '/setup/rtk'
		setupProcess.rtk = true
	}
	if (!isLoraSetted) {
		redirectPath = '/setup/lora?next=' + redirectPath
		setupProcess.lora = true
	}
	if (redirectPath) {
		router.push(redirectPath)
	}
})
</script>

<template>
	<main id="main">
		<RtkStatus class="rtk-status" />
		<LogBlock ref="logBlk" class="log-block" />
	</main>
</template>

<style scoped>
#main {
	display: grid;
	height: calc(100vh - 5rem);
	padding-bottom: 1rem;
	grid-gap: 0.5rem;
	grid-template:
		'a a r r' 10rem
		'a a l l' auto
		/ auto auto;
}

.rtk-status {
	grid-area: r;
	height: 10rem;
}

.log-block {
	grid-area: l;
	height: 100%;
}
</style>
