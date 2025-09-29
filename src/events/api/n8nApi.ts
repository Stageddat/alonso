import { Events, Message } from 'discord.js';
import { Logger } from '@/lib/logger.js';
import { courses } from '@/config/courses';
import { Item } from '@/types/item';
import { itemType } from '@/config/itemType';
import { ItemModel } from '@/models/itemModel';
import { DbItem } from '@/types/dbItem';
import { itemStatus } from '@/enum/itemStatus';
import { errorStatus } from '@/enum/errorStatus';

const n8nApiEvent = {
	name: Events.MessageCreate,
	once: false,
	async execute(message: Message) {
		if (
			message.author.id !== '1421265168569991328' ||
			message.channel.id !== '1421265117273915513'
		) {
			return;
		}

		// Limpiar el texto
		const clearText = message.content.replace(/^```|```$/g, '');

		// Sacar la información necesaria
		try {
			const item: Item = JSON.parse(clearText) as Item;
			const prettyJSON = JSON.stringify(item, null, 2);
			await message.reply('```json\n' + prettyJSON + '\n```');

			// Logger.debug(`ITEM DATA:`);
			Logger.debug(`name: ${item.name}`);
			// Logger.debug(`url: ${item.url}`);
			Logger.debug(`ends at: ${item.property_fecha_l_mite.start}`);

			const course = courses.find((c) => c.id === item.property_curso[0]);
			const type = itemType.find((c) => c.id === item.property_tipo[0]);

			if (!course || !type) {
				Logger.error('Course or type not found');
				return;
			}

			// Logger.debug(`Course: ${course.property_nombre_completo}`);
			// Logger.debug(`Type: ${type.name}`);

			const dbItem: DbItem = {
				id: item.id,
				title: item.name,
				moodle_link: item.property_url,
				notion_link: item.url,
				users_completed: undefined,
				due_date: item.property_fecha_l_mite.start,
				item_type: type.name,
				course: course.name,
			};

			// Añadir o modificar
			const dbStatus = await ItemModel.addModifyItem({ item: dbItem });
			// Logger.debug(`Database status: ${dbStatus}`);

			// Conseguir la fecha del item y de hoy
			// La fecha del item es la que se saga del api n8n
			const itsSameDay =
				new Date(item.property_fecha_l_mite.start).toLocaleDateString('es-ES', {
					timeZone: 'Europe/Madrid',
				}) === new Date().toLocaleDateString('es-ES', { timeZone: 'Europe/Madrid' });
			// Logger.debug(
			// 	new Date(item.property_fecha_l_mite.start).toLocaleDateString('es-ES', {
			// 		timeZone: 'Europe/Madrid',
			// 	}),
			// );
			// Logger.debug(new Date().toLocaleDateString('es-ES', { timeZone: 'Europe/Madrid' }));
			// Logger.debug('Es el mismo dia? ' + esMismoDia);
			switch (dbStatus) {
				case errorStatus.databaseFailed: {
					// No imprimir de nuevo el error
					return;
				}
				case itemStatus.newItemRegistered: {
					if (!itsSameDay) return;
					Logger.debug('The item ' + item.name + ' is the same day as today');
					break;
				}
				case itemStatus.itemIsEqual: {
					if (!itsSameDay) return;
					Logger.debug('The item ' + item.name + ' is the same day as today');
					break;
				}
				case itemStatus.itemUpdated: {
					if (!itsSameDay) return;
					Logger.debug('The item ' + item.name + ' is the same day as today');
					break;
				}
			}
		} catch (error) {
			Logger.error('Error parsing JSON from message:', error);
		}
	},
};

export default n8nApiEvent;
