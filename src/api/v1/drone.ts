import axios from 'axios'

import { RespStatus } from './index'
import type { MultiOpResp, DroneAction } from './index'

export async function requestDroneAction(
	action: DroneAction,
	drones: number[] | null,
): Promise<RespStatus<MultiOpResp>> {
	return await axios
		.post<MultiOpResp>(
			`/api/drone/action`,
			{
				action: action,
				d: drones,
			},
			{
				validateStatus: (status) => 200 <= status && status < 600,
			},
		)
		.then(RespStatus.fromAxios)
}

export async function changeDroneMode(mode: number, drones: number[] | null): Promise<RespStatus<MultiOpResp>> {
	return await axios
		.post<MultiOpResp>(
			`/api/drone/mode`,
			{
				mode: mode,
				d: drones,
			},
			{
				validateStatus: (status) => 200 <= status && status < 600,
			},
		)
		.then(RespStatus.fromAxios)
}
