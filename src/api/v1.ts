import axios from 'axios'

export * from './index'
import { RespStatus, type Device, type RTKConfig, type RTKInfo } from './index'

interface AvaliableDevicesResp {
	devices: Device[]
}

export async function getAvaliableDevices(): Promise<Device[]> {
	const resp = await axios.get<AvaliableDevicesResp>(`/api/devices`)
	return resp.data.devices
}

export async function connectLoraPort(deviceName: string, baudRate: number): Promise<RespStatus> {
	return await axios
		.post(`/api/lora/connect`, {
			device: deviceName,
			baudRate: baudRate,
		})
		.then(() => RespStatus.OK)
		.catch(RespStatus.fromError)
}

export async function connectRtkPort(config: RTKConfig): Promise<RespStatus> {
	return await axios
		.post(`/api/rtk/connect`, config)
		.then(() => RespStatus.OK)
		.catch(RespStatus.fromError)
}

export async function getRtkStatus(): Promise<RTKInfo> {
	const resp = await axios.get<RTKInfo>(`/api/rtk/status`)
	return resp.data
}
