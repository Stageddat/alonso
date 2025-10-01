import { DateTime } from 'luxon';

export function normalizeToUTC(dateString: string): string {
	if (!dateString) return '';

	// Reparar formato PocketBase
	const fixedDate = dateString.includes(' ') ? dateString.replace(' ', 'T') : dateString;

	// Caso 1: sólo fecha "YYYY-MM-DD"
	if (/^\d{4}-\d{2}-\d{2}$/.test(fixedDate)) {
		const dateTime = DateTime.fromISO(fixedDate, { zone: 'Europe/Madrid' })
			.set({ hour: 23, minute: 59, second: 0, millisecond: 0 })
			.toUTC();
		return dateTime.toISO() || '';
	}

	// Caso 2: fecha con hora (ISO completo con o sin zona)
	const dateTime = DateTime.fromISO(fixedDate).toUTC();
	return dateTime.toISO() || '';
}
