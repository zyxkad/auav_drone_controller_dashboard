export * from './index'
import { RespStatus, type Device, type RTKConfig } from './index'

async function randomSleep(min: number, max?: number): Promise<number> {
	max ||= min
	const dur = (Math.random() * (max - min) + min) * 1000
	return new Promise((resolve) =>
		setTimeout(() => {
			resolve(dur)
		}, dur),
	)
}

export async function getAvaliableDevices(): Promise<Device[]> {
	await randomSleep(0.1, 5)
	return [
		{
			name: '/dev/cu.1',
			description: 'desc cu.1',
		},
		{
			name: '/dev/cu.2',
			description: 'n/a',
		},
		{
			name: '/dev/cu.fortest121',
			description: 'O0OoO0o0O',
		},
	]
}

export async function connectLoraPort(deviceName: string, baudRate: number): Promise<RespStatus> {
	await randomSleep(0.1, 5)
	return RespStatus.OK
}

export async function connectRtkPort(config: RTKConfig): Promise<RespStatus> {
	await randomSleep(0.1, 5)
	return RespStatus.OK
}
