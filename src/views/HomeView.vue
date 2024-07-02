<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSetupProcessStore } from '@/stores/setup'
import LogBlock from '@/components/LogBlock.vue'
import * as api from '@/api/instance'

const router = useRouter()
const setupProcess = useSetupProcessStore()

const logBlk = ref<InstanceType<typeof LogBlock>>()

onMounted(() => {
	let redirectPath = ''
	const {
		lora: isLoraSetted,
		rtk: isRtkSetted,
	} = setupProcess
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
	<main>
		TODO
		<LogBlock ref="logBlk" class="log-block" />
	</main>
</template>

<style scoped>
.log-block {
	height: 50vh;
}
</style>
