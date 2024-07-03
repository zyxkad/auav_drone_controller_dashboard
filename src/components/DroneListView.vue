<script setup lang="ts">
import { ref } from 'vue'
import type { DroneInfo } from '@/api'

const drones = ref<DroneInfo[]>([])
</script>

<template>
	<Card>
		<template #title> Drones </template>
		<template #content>
			<div class="drone-list">
				<div v-for="drone in drones" class="drone">
					<b>{{ drone.id }}</b>
				</div>
			</div>
		</template>
	</Card>
</template>

<style scoped>
.drone-list {
	display: flex;
	flex-direction: column;
	width: 100%;
}

.drone {
	display: flex;
	flex-direction: row;
	align-items: center;
	width: 100%;
}
</style>
