import { AxiosError } from 'axios'

export enum RespStatus {
	OK = 200,
	NotFound = 404,
	Conflict = 409,
}

export namespace RespStatus {
	export async function fromError(err: unknown) {
		if (err instanceof AxiosError) {
			if (err.response) {
				switch (err.response.status) {
					case 404:
						return RespStatus.NotFound
					case 409:
						return RespStatus.Conflict
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
