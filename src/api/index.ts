import { AxiosError } from 'axios'

export enum RespStatus {
	OK = 200,
	NOT_FOUND = 404,
	CONFLICT = 409,
}

export namespace RespStatus {
	export async function fromError(err: unknown) {
		if (err instanceof AxiosError) {
			if (err.response) {
				switch (err.response.status) {
					case 404:
						return RespStatus.NOT_FOUND
					case 409:
						return RespStatus.CONFLICT
				}
			}
		}
		throw err
	}
}

export interface Device {
	name: string
	description: string
}

export type RTKConfig = {
	device: string
	baudRate: number
} & (
	| {
			surveyIn: false
	  }
	| {
			surveyIn: true
			surveyInDur: number
			surveyInAcc: number
	  }
)

export enum RTKStatus {
	NONE = 'N/A',
	SURVEY_IN = 'SVIN',
	READY = 'READY',
	OK = 'OK',
}

export interface RTKInfo {
	status: RTKStatus
	svinDur: number
	svinAcc: number
}
