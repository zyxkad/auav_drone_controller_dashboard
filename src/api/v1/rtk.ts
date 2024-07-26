import axios from 'axios'

import { RespStatus } from './index'
import type { RTKConfig, SatelliteConfig } from './index'

export async function connectedRtkPort(): Promise<RTKConfig | null> {
	const resp = await axios.get<RTKConfig | null>(`/api/rtk/connect`)
	return resp.data
}

export async function tryConnectRtkPort(config: RTKConfig): Promise<RespStatus> {
	return await axios
		.post(`/api/rtk/connect`, config, {
			validateStatus: (status) => 200 <= status && status < 600,
		})
		.then(RespStatus.fromAxios)
}

export async function disconnectRtkPort(): Promise<RespStatus> {
	return await axios
		.delete(`/api/rtk/connect`, {
			validateStatus: (status) => 200 <= status && status < 600,
		})
		.then(() => RespStatus.OK)
		.catch(RespStatus.fromAxios)
}

export async function connectRtkPort(config: RTKConfig): Promise<RespStatus> {
	const resp = await tryConnectRtkPort(config)
	if (resp.status !== 409) {
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
		.post(`/api/satellite/config`, config, {
			validateStatus: (status) => 200 <= status && status < 600,
		})
		.then(RespStatus.fromAxios)
}
