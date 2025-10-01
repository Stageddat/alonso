import { itemTypeColor } from '@/enum/itemTypeColor';
import { Logger } from '@/lib/logger';
import { DbItem } from '@/types/dbItem';
import { EmbedBuilder } from 'discord.js';

export const todayItemEmbed = (dbItem: DbItem) => {
	// get item course color
	const colorHex = itemTypeColor[dbItem.course as keyof typeof itemTypeColor];
	const color = parseInt(colorHex, 16);

	let unixTimestamp: number | null = null;

	if (dbItem.due_date) {
		Logger.debug('The item ', dbItem.title, ' due date is ', dbItem.due_date);

		let date: Date;

		// Detectar si el string es solo YYYY-MM-DD (sin hora)
		if (/^\d{4}-\d{2}-\d{2}$/.test(dbItem.due_date)) {
			// Añadir hora 23:59 y zona horaria +02:00
			date = new Date(dbItem.due_date + 'T23:59:00+02:00');
		} else {
			// Intentar parsear directamente
			date = new Date(dbItem.due_date);
		}

		// Validar que sea una fecha válida
		if (!isNaN(date.getTime())) {
			unixTimestamp = Math.floor(date.getTime() / 1000);
		} else {
			Logger.debug('Fecha inválida para el item ', dbItem.title);
		}

		Logger.debug('The item ', dbItem.title, ' due date unix timestamp is ', unixTimestamp);
	}

	return new EmbedBuilder()
		.setColor(color)
		.setTitle(dbItem.title)
		.setDescription(null)
		.addFields([
			{
				name: 'Moodle URL',
				value: `[Abrir en Moodle](${dbItem.moodle_link})`,
				inline: true,
			},
			{
				name: 'Se acaba',
				value: unixTimestamp ? `<t:${unixTimestamp}:R>` : 'Sin fecha',
				inline: true,
			},
			{
				name: 'Fecha límite',
				value: unixTimestamp ? `<t:${unixTimestamp}:F>` : 'No especificada',
				inline: true,
			},
			{
				name: 'Materia',
				value: dbItem.course,
				inline: true,
			},
			{
				name: 'Tipo',
				value: dbItem.item_type,
				inline: true,
			},
			{
				name: '\u200b',
				value: '\u200b',
				inline: true,
			},
		]);
};
