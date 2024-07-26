import axios from 'axios'

import { RespStatus } from './index'
import type { GPSData, MultiOpResp, DirectorStatus } from './index'

export async function initDirector(
	origin: GPSData,
	slots: number[][],
	heading: number,
	height: number,
): Promise<RespStatus<MultiOpResp>> {
	return await axios
		.post<MultiOpResp>(
			`/api/director/init`,
			{
				origin: origin,
				slots: slots,
				heading: heading,
				height: height,
			},
			{
				validateStatus: (status) => 200 <= status && status < 600,
			},
		)
		.then(RespStatus.fromAxios)
}

export async function destroyDirector(): Promise<RespStatus<MultiOpResp>> {
	return await axios
		.delete<MultiOpResp>(`/api/director/destroy`, {
			validateStatus: (status) => 200 <= status && status < 600,
		})
		.then(RespStatus.fromAxios)
}

export async function assignDirector(droneId: number): Promise<RespStatus<MultiOpResp>> {
	return await axios
		.post<MultiOpResp>(
			`/api/director/assign`,
			{
				drone: droneId,
			},
			{
				validateStatus: (status) => 200 <= status && status < 600,
			},
		)
		.then(RespStatus.fromAxios)
}

export async function directorCheckAssign(): Promise<RespStatus<MultiOpResp>> {
	return await axios
		.post<MultiOpResp>(`/api/director/check`, null, {
			validateStatus: (status) => 200 <= status && status < 600,
		})
		.then(RespStatus.fromAxios)
}

export async function directorTransferAssign(): Promise<RespStatus<MultiOpResp>> {
	return await axios
		.post<MultiOpResp>(`/api/director/transfer`, null, {
			validateStatus: (status) => 200 <= status && status < 600,
		})
		.then(RespStatus.fromAxios)
}

export async function directorCancelAssign(): Promise<RespStatus<MultiOpResp>> {
	return await axios
		.post<MultiOpResp>(`/api/director/cancel`, null, {
			validateStatus: (status) => 200 <= status && status < 600,
		})
		.then(RespStatus.fromAxios)
}

export async function pollDirector(): Promise<RespStatus<DirectorStatus>> {
	return await axios
		.get<DirectorStatus>(`/api/director/poll`, {
			validateStatus: (status) => 200 <= status && status < 600,
		})
		.then(RespStatus.fromAxios)
}
