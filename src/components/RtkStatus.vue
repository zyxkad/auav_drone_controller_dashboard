<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useRequest } from 'vue-request'
import Card from 'primevue/card'
import { RTKStatus, type RTKInfo } from '@/api'
import { onAwsEvent } from '@/stores/aws'

const rtkInfo = reactive<RTKInfo>({
	status: RTKStatus.NONE,
	svinDur: 0,
	svinAcc: 0,
	satellites: {},
})

const satelliteNum = computed(() => {
	let count = 0
	for (const data of Object.values(rtkInfo.satellites)) {
		if (data.using) {
			count += data.count
		}
	}
	return count
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
				<div class="content content-right">
					<div>
						<b>Base Satellite</b>
						<span class="flex-row-center flex-end">
							<span>{{ satelliteNum }}</span>
							<span class="pi pi-info-circle satellite-info-icon">
								<div class="satellite-info-box">
									<h4 style="margin: 0; margin-bottom: 0.5rem">
										{{ Object.keys(rtkInfo.satellites).length }} satellites
									</h4>
									<div
										v-for="[name, { using, count }] in Object.entries(rtkInfo.satellites).sort(
											([name1, { count: count1 }], [name2, { count: count2 }]) => count2 - count1,
										)"
										class="flex-row-center flex-space-between"
									>
										<span>
											<b class="satellite-name">{{ name }}</b>
											<i v-if="!using" style="font-size: 0.8em">*</i>
										</span>
										<span class="satellite-count">{{ count }}</span>
									</div>
								</div>
							</span>
						</span>
					</div>
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

.content > div > span {
	min-width: 3rem;
}

.satellite-info-icon {
	position: relative;
	margin-left: 0.5rem;
}

.satellite-info-box {
	position: absolute;
	top: 1.4rem;
	right: -0.5rem;
	z-index: 99;
	display: flex;
	flex-direction: column;
	width: 10rem;
	padding: 0.4rem;
	font-family: monospace;
	font-size: 0.8rem;
	color: #fffe;
	background-color: #000a;
	border-radius: 0.3rem;
}

.satellite-info-icon:not(:hover) > .satellite-info-box {
	display: none;
}

.satellite-info-box::before {
	content: ' ';
	position: absolute;
	top: -1rem;
	right: 0.5rem;
	display: block;
	border: 0.5rem solid #0000;
	border-bottom-color: #000a;
}
</style>
