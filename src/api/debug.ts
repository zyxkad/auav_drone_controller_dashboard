export * from './index'
import {
	RespStatus,
	RTKStatus,
	type Device,
	type LoraConfig,
	type RTKConfig,
	type RTKInfo,
} from './index'

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
			description: 'a really really really really really long desc',
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

export async function connectLoraPort(config: LoraConfig): Promise<RespStatus> {
	await randomSleep(0.1, 5)
	return RespStatus.OK
}

var rtkSvinSimInterval: ReturnType<typeof setInterval> | undefined = undefined

export async function connectRtkPort(config: RTKConfig): Promise<RespStatus> {
	await randomSleep(0.1, 5)
	rtkStatus.status = RTKStatus.SURVEY_IN
	rtkStatus.svinDur = 0
	rtkStatus.svinAcc = 9999
	clearInterval(rtkSvinSimInterval)
	rtkSvinSimInterval = setInterval(() => {
		rtkStatus.svinDur++
		if (rtkStatus.svinAcc > 10) {
			rtkStatus.svinAcc -= (rtkStatus.svinAcc - 10) / 2 - Math.random() * 5
		} else {
			rtkStatus.svinAcc -= 0.1 + (Math.random() * 1.2 - 0.5)
		}
		if (rtkStatus.svinAcc <= 1) {
			rtkStatus.status = RTKStatus.READY
			clearInterval(rtkSvinSimInterval)
			rtkSvinSimInterval = undefined
		}
	}, 1000)
	return RespStatus.OK
}

const rtkStatus: RTKInfo = {
	status: RTKStatus.NONE,
	svinDur: 0,
	svinAcc: 0,
}

export async function getRtkStatus(): Promise<RTKInfo> {
	await randomSleep(0.1, 0.5)
	return rtkStatus
}
