import { ref, onBeforeUnmount } from 'vue'
import { defineStore } from 'pinia'
import AWS from 'go-aws'
import type { Listener } from 'go-aws'

const useAwsStoreRef = defineStore('awsInstance', () => {
	const aws = new AWS({
		url: '/api/io',
		protocols: 'dwc-io-v1',
	})
	return { get: () => aws }
})

export function useAwsStore(): AWS {
	const { get } = useAwsStoreRef()
	return get()
}

export function onAwsEvent<T = any>(
	event: string,
	listener: Listener<T> | null,
	options?: AddEventListenerOptions | boolean,
) {
	const aws = useAwsStore()
	aws.addEventListener(event, listener as EventListener, options)
	onBeforeUnmount(() => {
		aws.removeEventListener(event, listener as EventListener, options)
	})
}

export function offAwsEvent<T = unknown>(
	event: string,
	listener: Listener<T> | null,
	options?: EventListenerOptions | boolean,
) {
	const aws = useAwsStore()
	aws.removeEventListener(event, listener as EventListener, options)
}

export function sendAwsMessage(event: string, data?: any) {
	const aws = useAwsStore()
	aws.send(event, data)
}
