import axios from 'axios'

export * from './index'
import { RespStatus, type Device, type LoraConfig, type RTKConfig, type RTKInfo } from './index'

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

export async function connectLoraPort(config: LoraConfig): Promise<RespStatus> {
	return await axios
		.post(`/api/lora/connect`, config)
		.then(() => RespStatus.OK)
		.catch(RespStatus.fromError)
}

export async function connectedRtkPort(): Promise<RTKConfig | null> {
	const resp = await axios.get<RTKConfig | null>(`/api/rtk/connect`)
	return resp.data
}

export async function connectRtkPort(config: RTKConfig): Promise<RespStatus> {
	return await axios
		.post(`/api/rtk/connect`, config)
		.then(() => RespStatus.OK)
		.catch(RespStatus.fromError)
}
