<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
import Button from 'primevue/button'
import Toast from 'primevue/toast'

const loraConnected = ref(false)
const rtkConnected = ref(false)
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
		</nav>
	</header>

	<RouterView />
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
	background-color: var(--primary-50);
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

.head-nav a {
	margin-left: 1rem;
	color: var(--primary-color);
}
</style>
