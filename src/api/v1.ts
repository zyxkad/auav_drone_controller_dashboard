import axios from 'axios'

export * from './index'
import {
	RespStatus,
	type Device,
	type LoraConfig,
	type RTKConfig,
	type RTKInfo,
	type SatelliteConfig,
} from './index'

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
		.post(`/api/lora/connect`, config)
		.then(() => RespStatus.OK)
		.catch(RespStatus.fromError)
}

export async function disconnectLoraPort(): Promise<RespStatus> {
	return await axios
		.delete(`/api/lora/connect`)
		.then(() => RespStatus.OK)
		.catch(RespStatus.fromError)
}

export async function connectLoraPort(config: LoraConfig): Promise<RespStatus> {
	const resp = await tryConnectLoraPort(config)
	if (resp.code !== 409) {
		return resp
	}
	const resp2 = await disconnectLoraPort()
	if (!resp2.ok) {
		return resp2
	}
	return await tryConnectLoraPort(config)
}

export async function connectedRtkPort(): Promise<RTKConfig | null> {
	const resp = await axios.get<RTKConfig | null>(`/api/rtk/connect`)
	return resp.data
}

export async function tryConnectRtkPort(config: RTKConfig): Promise<RespStatus> {
	return await axios
		.post(`/api/rtk/connect`, config)
		.then(() => RespStatus.OK)
		.catch(RespStatus.fromError)
}

export async function disconnectRtkPort(): Promise<RespStatus> {
	return await axios
		.delete(`/api/rtk/connect`)
		.then(() => RespStatus.OK)
		.catch(RespStatus.fromError)
}

export async function connectRtkPort(config: RTKConfig): Promise<RespStatus> {
	const resp = await tryConnectRtkPort(config)
	if (resp.code !== 409) {
		return resp
	}
	const resp2 = await disconnectRtkPort()
	if (!resp2.ok) {
		return resp2
	}
	return await tryConnectRtkPort(config)
}

export async function getSatelliteConfig(): Promise<SatelliteConfig> {
	const resp = await axios.get<SatelliteConfig>(`/api/satellite/config`)
	return resp.data
}

export async function updateSatelliteConfig(config: SatelliteConfig): Promise<RespStatus> {
	return await axios
		.post(`/api/satellite/config`, config)
		.then(() => RespStatus.OK)
		.catch(RespStatus.fromError)
}
