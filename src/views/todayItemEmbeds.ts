import { itemTypeColor } from '@/enum/itemTypeColor';
import { DbItem } from '@/types/dbItem';
import { EmbedBuilder } from 'discord.js';

export const todayItemEmbed = (dbItem: DbItem) => {
	// get item course color
	const colorHex = itemTypeColor[dbItem.course as keyof typeof itemTypeColor];
	const color = parseInt(colorHex, 16);

	let unixTimestamp: number | null = null;

	if (dbItem.due_date) {
		// Convertir fecha con hora a timestamp
		let date = new Date(dbItem.due_date);

		// Añadir hora a la fecha si no hay de 23:59
		if (!dbItem.due_date.includes('T')) {
			const dateOnly = new Date(dbItem.due_date + 'T23:59:00+02:00');
			date = dateOnly;
		}

		// Convertir a timestamp
		unixTimestamp = Math.floor(date.getTime() / 1000);
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
