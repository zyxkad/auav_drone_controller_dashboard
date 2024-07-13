import { AxiosError } from 'axios'

export class RespStatus {
	static readonly OK = new RespStatus(200)
	static readonly NOT_FOUND = new RespStatus(404, 'Resource not found')
	static readonly CONFLICT = new RespStatus(409, 'Operition conflicts')

	readonly code: number
	readonly message: string
	constructor(code: number, message?: string) {
		this.code = code
		this.message = message || ''
	}

	get ok(): boolean {
		return 100 <= this.code && this.code < 400
	}

	toString(): string {
		let s = String(this.code)
		if (this.message) {
			s += ': ' + this.message
		}
		return s
	}

	static fromError(err: unknown) {
		if (err instanceof AxiosError) {
			if (err.response) {
				const code = err.response.status
				switch (code) {
					case 404:
						return RespStatus.NOT_FOUND
					case 409:
						return RespStatus.CONFLICT
					default:
						if (400 <= code && code < 600) {
							const { data } = err.response
							if (typeof data !== 'object') {
								return new RespStatus(code, String(data))
							}
							return new RespStatus(code, data.message || data.error)
						}
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

export interface RTKConfig {
	device: string
	baudRate: number
	surveyIn: boolean
	surveyInDur: number
	surveyInAcc: number
}

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
	satellites: {
		[name: string]: {
			count: number
			using: boolean
		}
	}
}

export enum DroneStatus {
	NONE = 'N/A',
	UNSTABLE = 'UNSTABLE',
	READY = 'READY',
	SLEEPING = 'SLEEPING',
	ARMED = 'ARMED',
	TAKENOFF = 'TAKENOFF',
	NAV = 'NAV',
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

export interface GPSData {
	lat: number // in degrees
	lon: number // in degrees
	alt: number // in meters
}

export interface Vec3 {
	x: number
	y: number
	z: number
}

export interface RotateData {
	roll: number
	pitch: number
	yaw: number
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

export interface DroneExtraInfo {
	LED: ColorInfo
}

export interface DroneStatusInfo {
	id: number
	status: DroneStatus
	mode: number
	battery: BatteryStat
	home: GPSData
	lastActivate: number // epoch in milliseconds
	extra?: DroneExtraInfo | null
}

export interface DronePositionInfo {
	id: number
	gpsType: GPSType
	gps: GPSData
	rotate: RotateData
}

export interface DronePingInfo {
	id: number
	bootTime: number // epoch in milliseconds
	ping: number // µs
}

export type DroneInfo = {
	id: number
	status?: DroneStatus
	mode?: number
	battery?: BatteryStat
	gpsType?: GPSType
	gps?: GPSData
	home?: GPSData
	rotate?: RotateData
	ping?: number
	lastActivate?: number
	extra?: DroneExtraInfo | null
}

export interface SatelliteConfig {
	GPS: boolean
	GLONASS: boolean
	Galileo: boolean
	BeiDou: boolean
	PVT: boolean
}

export interface LogMessage {
	time: number
	lvl: string
	msg: string
}

export interface DirectorPos {
	latitude: number
	longitude: number
	altitude: number
	heading: number
}

export enum DroneAction {
	ARM = 'ARM',
	DISARM = 'DISARM',
	HOME = 'HOME',
	LAND = 'LAND',
	TAKEOFF = 'TAKEOFF',
	HOLD = 'HOLD',
	SLEEP = 'SLEEP',
	WAKEUP = 'WAKEUP',
}

export interface DirectorDrone {
	id: number
	action: DroneAction
}
