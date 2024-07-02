import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useSetupProcessStore = defineStore('setupProcess', () => {
	return {
		lora: ref(false),
		rtk: ref(false),
	}
})
