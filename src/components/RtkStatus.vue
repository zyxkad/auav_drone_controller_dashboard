<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useRequest } from 'vue-request'
import Card from 'primevue/card'
import { RTKStatus, type RTKInfo } from '@/api'
import * as api from '@/api/instance'

const rtkInfo = reactive<RTKInfo>({
	status: RTKStatus.NONE,
	svinDur: 0,
	svinAcc: 0,
})

// TODO: should use socket.io push
const { data, error, loading } = useRequest(() => api.getRtkStatus(), {
	pollingInterval: 1000,
	loadingDelay: 500,
	loadingKeep: 2000,
})

watch(data, (info: RTKInfo | undefined) => {
	if (!info) {
		return
	}
	rtkInfo.status = info.status
	rtkInfo.svinDur = info.svinDur
	rtkInfo.svinAcc = info.svinAcc
})
</script>

<template>
	<Card>
		<template #title> RTK Status </template>
		<template #content>
			<div class="content">
				<div>
					<b>Status</b>
					<span>{{ rtkInfo.status }}</span>
				</div>
				<div>
					<b>SvIn Duration</b>
					<span>{{ rtkInfo.svinDur }}s</span>
				</div>
				<div>
					<b>Accuracy</b>
					<span>{{ rtkInfo.svinAcc.toFixed(2) }}m</span>
				</div>
			</div>
		</template>
	</Card>
</template>

<style scoped>
.content {
	display: flex;
	flex-direction: column;
	width: 100%;
}

.content > div {
	display: flex;
	flex-direction: row;
	align-items: center;
	width: 100%;
}

.content > div > b {
	width: 8rem;
}
</style>
