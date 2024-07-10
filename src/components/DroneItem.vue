<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import ColorPicker from 'primevue/colorpicker'
import { DroneStatus, GPSType, type ColorInfo, type DroneInfo } from '@/api'

const props = defineProps<{
	drone: DroneInfo
}>()

const emit = defineEmits<{
	(e: 'ledChanged', color: ColorInfo): void
}>()

const now = ref(Date.now())
const picker = ref<InstanceType<typeof ColorPicker>>()
const droneLedColor = computed({
	get(): ColorInfo {
		return props.drone.extra?.LED || { r: 0, g: 0, b: 0 }
	},
	set(value: ColorInfo) {
		emit('ledChanged', value)
	},
})

function formatLastActivate(ts: number): string {
	let dur = now.value - ts
	if (dur <= 1000) {
		return 'now'
	}
	dur /= 1000
	if (dur < 61) {
		return Math.floor(dur) + 's'
	}
	dur /= 60
	if (dur < 61) {
		return Math.floor(dur) + 'min'
	}
	dur /= 60
	if (dur < 73) {
		return Math.floor(dur) + 'h'
	}
	dur /= 24
	return Math.floor(dur) + 'd'
}

let timeUpdater: ReturnType<typeof setInterval> | undefined = undefined
onMounted(() => {
	timeUpdater = setInterval(() => {
		now.value = Date.now()
	}, 1000)
})

onBeforeUnmount(() => {
	clearInterval(timeUpdater)
})
</script>

<template>
	<div class="drone">
		<div class="status-light" :status="drone.status"></div>
		<b class="id">{{ drone.id }}</b>
		<b class="status">{{ drone.status }}</b>
		<div class="voltage">{{ drone.battery?.voltage.toFixed(3) || '--' }}</div>
		<div class="current">{{ drone.battery?.current.toFixed(3) || '--' }}</div>
		<b class="remaining">{{ drone.battery ? (drone.battery.remaining * 100).toFixed(1) : '--' }}</b>
		<b class="gps-type">{{ drone.gpsType ? GPSType.asString(drone.gpsType) : '--' }}</b>
		<!-- TODO: Show visible satellites -->
		<div class="gps">
			(<span>{{ drone.gps?.lat.toFixed(5) || '--' }}</span
			>, <span>{{ drone.gps?.lon.toFixed(5) || '--' }}</span
			>, <span>{{ drone.gps?.alt.toFixed(2) || '--' }}</span
			>)
		</div>
		<b class="last-activate">{{
			drone.lastActivate ? formatLastActivate(drone.lastActivate) : 'never'
		}}</b>
		<!-- TODO: Only need a few colors and flash for LED control -->
		<ColorPicker
			ref="picker"
			class="led"
			:class="drone.status === DroneStatus.NONE ? 'not-allowed' : null"
			format="rgb"
			:disabled="drone.status === DroneStatus.NONE"
			v-model="droneLedColor"
		/>
	</div>
</template>

<style scoped>
.drone {
	display: flex;
	flex-direction: row;
	align-items: center;
	width: 100%;
	min-width: max-content;
	height: 3rem;
	border-bottom: var(--p-surface-300) solid 1px;
	font-family: 'Courier New', monospace;
	white-space: nowrap;
}

.drone > * {
	display: inline-block;
	flex-shrink: 0;
	margin-right: 0.5em;
}

.status-light {
	width: 1.6rem;
	height: 1.6rem;
	margin: 0 0.8rem 0 0.2rem;
	border-radius: 50%;
	transition: 1s background-color ease-out;
	background-color: var(--flash-out);
	--flash-from: var(--p-surface-400);
	--flash-to: var(--p-surface-400);
	animation: flash 1s infinite ease-out;
}

.status-light[status='N/A'] {
	--flash-to: var(--p-orange-500);
	animation-duration: 2.5s;
}

.status-light[status='READY'] {
	background-color: var(--p-green-600);
	animation: none;
}

.status-light[status='SLEEPING'] {
	--flash-to: var(--p-cyan-500);
	animation-duration: 4s;
}

.status-light[status='ARMED'] {
	--flash-from: var(--p-yellow-600);
	--flash-to: var(--p-lime-500);
}

.status-light[status='TAKENOFF'] {
	background-color: var(--p-yellow-500);
	animation: none;
}

.status-light[status='ERROR'] {
	--flash-to: var(--p-red-500);
	animation-duration: 1s;
}

.id {
	width: 2em;
}

.status {
	width: 5em;
}

.voltage,
.current {
	width: 4.2em;
}

.voltage::after {
	content: 'V';
	font-size: 0.8em;
}

.current::after {
	content: 'A';
	font-size: 0.8em;
}

.remaining {
	width: 3.5em;
	padding-right: 0.5em;
	text-align: right;
}

.remaining::after {
	content: '%';
	font-size: 0.8em;
}

.gps-type {
	width: 5.5em;
}

.gps {
	width: 18.5em;
}

.last-activate {
	width: 3rem;
}

.led {
	border-radius: 0.2rem;
	transition: 0.5s background-color ease-out;
	background-color: var(--led-color);
}
</style>
