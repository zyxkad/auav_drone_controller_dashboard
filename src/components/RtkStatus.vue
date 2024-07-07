<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useRequest } from 'vue-request'
import Card from 'primevue/card'
import { RTKStatus, type RTKInfo } from '@/api'
import { onAwsEvent } from '@/stores/aws'

const rtkInfo = reactive<RTKInfo>({
	status: RTKStatus.NONE,
	svinDur: 0,
	svinAcc: 0,
	satelliteNum: -1,
})

onAwsEvent<RTKInfo>('rtk-status', ({ data }) => {
	Object.assign(rtkInfo, data)
})

interface RTKSurveyInData {
	dur: number
	acc: number
	valid: boolean
	active: boolean
}

onAwsEvent<RTKSurveyInData>('rtk-survey-in', ({ data }) => {
	rtkInfo.svinDur = data.dur
	rtkInfo.svinAcc = data.acc
	console.log('survey-in', data)
})
</script>

<template>
	<Card>
		<template #title>
			<h3 class="no-margin">RTK Status</h3>
		</template>
		<template #content>
			<div class="content-box">
				<div class="content content-left">
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
				<div class="content right">
					<div>
						<b>Base Satellite</b>
						<span>{{ rtkInfo.satelliteNum }}</span>
					</div>
					<!-- TODO: show if RTK activated -->
				</div>
			</div>
		</template>
	</Card>
</template>

<style scoped>
.content-box {
	display: flex;
	flex-direction: row;
}

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
