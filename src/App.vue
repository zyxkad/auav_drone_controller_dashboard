<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import Button from 'primevue/button'
import Toast from 'primevue/toast'
import DirectorSetupDialog from '@/components/DirectorSetupDialog.vue'
import DirectorControlDialog from '@/components/DirectorControlDialog.vue'
import * as api from '@/api/instance'

const loraConnected = ref(true)
const rtkConnected = ref(true)
const directorSetup = ref<typeof DirectorSetupDialog>()
const showDirector = ref(false)

onMounted(() => {
	api.connectedLoraPort().then((config) => {
		loraConnected.value = !!config
	})
	api.connectedRtkPort().then((config) => {
		rtkConnected.value = !!config
	})
	api.pollDirector().then((res) => {
		if (res.ok) {
			showDirector.value = true
		}
	})
})
</script>

<template>
	<header>
		<div class="no-select logo">
			<RouterLink to="/">
				<img src="/logo.png" />
			</RouterLink>
		</div>
		<nav class="head-nav">
			<RouterLink to="/setup/lora">
				<Button :severity="loraConnected ? 'secondary' : 'primary'" label="Setup Lora" />
			</RouterLink>
			<RouterLink to="/setup/rtk">
				<Button :severity="rtkConnected ? 'secondary' : 'primary'" label="Setup RTK" />
			</RouterLink>
			<RouterLink to="/setup/satellite">
				<Button severity="info" label="Satellite" />
			</RouterLink>
			<Button severity="contrast" label="Director" @click="directorSetup?.open()" />
		</nav>
	</header>

	<RouterView v-slot="{ Component }">
		<!-- TODO: embed HomeView but not use router -->
		<KeepAlive include="HomeView">
			<component :is="Component" @lora-bind="loraConnected = true" @rtk-bind="rtkConnected = true" />
		</KeepAlive>
	</RouterView>
	<DirectorSetupDialog ref="directorSetup" @setup="showDirector = true" />
	<DirectorControlDialog v-if="showDirector" @destroyed="showDirector = false" :avaliableDrones="[]" />
	<Toast position="top-right" />
</template>

<style scoped>
header {
	position: absolute;
	top: -4rem;
	left: 0;
	display: flex;
	flex-direction: row;
	align-items: center;
	width: 100%;
	height: 4rem;
	background-color: color-mix(in srgb, var(--p-primary-400) 15%, #0000);
	box-shadow: #0008 0 0 1rem -0.5rem;
	line-height: 1.5;
}

.logo {
	display: inline-block;
	width: 4rem;
	height: 4rem;
	margin-left: 1rem;
}

.logo img {
	width: 100%;
	height: 100%;
}

.head-nav {
	display: flex;
	flex-direction: row;
	align-items: center;
}

.head-nav > * {
	margin-left: 1rem;
}
</style>
