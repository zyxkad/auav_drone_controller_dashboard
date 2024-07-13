import type { Vec3, GPSData } from '@/api'

const EARTH_RADIUS = 6.371e6

export function calcRelativePos(pos: GPSData, origin: GPSData): Vec3 {
	const latUnit = ((EARTH_RADIUS + origin.alt) * Math.PI) / 180
	const lonUnit = ((EARTH_RADIUS + origin.alt) * Math.cos((origin.lat * Math.PI) / 180) * Math.PI) / 180
	return {
		x: (pos.lon - origin.lon) * lonUnit,
		y: (pos.lat - origin.lat) * latUnit,
		z: pos.alt - origin.alt,
	}
}
