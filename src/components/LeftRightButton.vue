<script setup lang="ts">
defineProps<{
	disabledLeft?: boolean
	disabledRight?: boolean
}>()

defineEmits<{
	(e: 'clickLeft', event: PointerEvent): void
	(e: 'clickRight', event: PointerEvent): void
}>()

import Button from 'primevue/button'
import InputGroup from 'primevue/inputgroup'
</script>

<template>
	<InputGroup>
		<Button
			v-show="!disabledLeft"
			:style="{ width: disabledRight ? '100%' : '50%' }"
			icon="pi pi-chevron-left"
			severity="secondary"
			@click="$emit('clickLeft', $event)"
		/>
		<Button
			v-show="!disabledRight"
			:style="{ width: disabledLeft ? '100%' : '50%' }"
			icon="pi pi-chevron-right"
			severity="secondary"
			@click="$emit('clickRight', $event)"
		/>
	</InputGroup>
</template>
