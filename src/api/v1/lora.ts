import axios from 'axios'

import { RespStatus } from './index'
import type { Device, LoraConfig } from './index'

interface AvaliableDevicesResp {
	devices: Device[]
}

export async function getAvaliableDevices(): Promise<Device[]> {
	const resp = await axios.get<AvaliableDevicesResp>(`/api/devices`)
	return resp.data.devices
}

export async function connectedLoraPort(): Promise<LoraConfig | null> {
	const resp = await axios.get<LoraConfig | null>(`/api/lora/connect`)
	return resp.data
}

async function tryConnectLoraPort(config: LoraConfig): Promise<RespStatus> {
	return await axios
		.post(`/api/lora/connect`, config, {
			validateStatus: (status) => 200 <= status && status < 600,
		})
		.then(RespStatus.fromAxios)
}

export async function disconnectLoraPort(): Promise<RespStatus> {
	return await axios
		.delete(`/api/lora/connect`, {
			validateStatus: (status) => 200 <= status && status < 600,
		})
		.then(RespStatus.fromAxios)
}

export async function connectLoraPort(config: LoraConfig): Promise<RespStatus> {
	const resp = await tryConnectLoraPort(config)
	if (resp.status !== 409) {
		return resp
	}
	const resp2 = await disconnectLoraPort()
	if (!resp2.ok) {
		return resp2
	}
	return await tryConnectLoraPort(config)
}
