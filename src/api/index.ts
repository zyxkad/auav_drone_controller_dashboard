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

export type LoraConfig = {
	device: string
	baudRate: number
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

export enum DroneStatus {
	NONE = 'N/A',
	READY = 'READY',
	SLEEPING = 'SLEEPING',
	ARMED = 'ARMED',
	TAKENOFF = 'TAKENOFF',
	ERROR = 'ERROR',
}

export enum GPSType {
	NO_GPS = 0,
	NO_FIX = 1,
	FIX_2D = 2,
	FIX_3D = 3,
	DGPS = 4,
	RTK_FLOAT = 5,
	RTK_FIXED = 6,
	STATIC = 7,
	PPP = 8,
}

export namespace GPSType {
	export function asString(typ: GPSType): string {
		switch (typ) {
			case GPSType.NO_GPS:
				return 'N/A'
			case GPSType.NO_FIX:
				return 'NO_FIX'
			case GPSType.FIX_2D:
				return '2D_FIX'
			case GPSType.FIX_3D:
				return '3D_FIX'
			case GPSType.DGPS:
				return 'DGPS'
			case GPSType.RTK_FLOAT:
				return 'RTK_FLOAT'
			case GPSType.RTK_FIXED:
				return 'RTK_FIXED'
			case GPSType.STATIC:
				return 'STATIC'
			case GPSType.PPP:
				return 'PPP'
			default:
				return 'UNKNOWN_GPS_' + String(typ)
		}
	}
}

export interface GPSInfo {
	type: GPSType
	lat: number // in degrees
	lon: number // in degrees
	alt: number // in meters
}

export interface BatteryStat {
	voltage: number // In V
	current: number // In A
	remaining: number // In %
}

export interface ColorInfo {
	r: number
	g: number
	b: number
}

export interface DroneInfo {
	status: DroneStatus
	id: number
	gps: GPSInfo
	battery: BatteryStat
	lastActivate: number // epoch in milliseconds
	led: ColorInfo
}
