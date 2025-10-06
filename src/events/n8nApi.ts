import { Events, Message } from 'discord.js';
import { Logger } from '@/lib/logger.js';
import { courses } from '@/config/courses';
import { Item } from '@/types/item';
import { itemType } from '@/config/itemType';
import { ItemModel } from '@/models/itemModel';
import { DbItem } from '@/types/dbItem';
import { normalizeToUTC } from '@/utils/normalizeToUTC';
import { updateDailyMsg } from '@/controllers/updateDailyMsg';

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

		if (message.attachments.size > 0) {
			const attachment = message.attachments.first();

			if (attachment && attachment.name === 'file.txt') {
				const response = await fetch(attachment.url);
				const text = await response.text();
				const items = JSON.parse(text) as Item[];

				for (const item of items) {
					const course = courses.find((c) => c.id === item.property_curso[0]);
					const type = itemType.find((c) => c.id === item.property_tipo[0]);

					if (!course || !type) continue;

					const dbItem: DbItem = {
						id: item.id,
						title: item.name,
						moodle_link: item.property_url,
						notion_link: item.url,
						users_completed: undefined,
						due_date: normalizeToUTC(item.property_fecha_l_mite.start),
						item_type: type.name,
						course: course.name,
					};

					await ItemModel.addModifyItem({ item: dbItem });
				}

				await updateDailyMsg.updateDayMsg();
				await message.reply('File processed correctly.');
				return;
			}
		}

		// Limpiar el texto
		const clearText = message.content
			.replace(/```(?:json)?/gi, '')
			.replace(/```$/g, '')
			.trim();
		console.log(clearText);

		// Sacar la información necesaria
		try {
			const item: Item = JSON.parse(clearText) as Item;

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
				due_date: normalizeToUTC(item.property_fecha_l_mite.start),
				item_type: type.name,
				course: course.name,
			};

			// Añadir o modificar
			const prettyJSON = JSON.stringify(dbItem, null, 2);
			await message.reply('```json\n' + prettyJSON + '\n```');

			// const dbStatus = await ItemModel.addModifyItem({ item: dbItem });
			await ItemModel.addModifyItem({ item: dbItem });
			await updateDailyMsg.updateDayMsg();
			Logger.debug('Updated item and daily message');
			// Logger.debug(`Database status: ${dbStatus}`);

			// IMPLEMENTAR UN SISTEMA DE ACTUALIZACION EL MENSAJE COMPLETA?

			// 	// Conseguir la fecha del item y de hoy
			// 	// La fecha del item es la que se saga del api n8n
			// 	const itsSameDay =
			// 		new Date(item.property_fecha_l_mite.start).toLocaleDateString('es-ES', {
			// 			timeZone: 'Europe/Madrid',
			// 		}) === new Date().toLocaleDateString('es-ES', { timeZone: 'Europe/Madrid' });
			// 	// Logger.debug(
			// 	// 	new Date(item.property_fecha_l_mite.start).toLocaleDateString('es-ES', {
			// 	// 		timeZone: 'Europe/Madrid',
			// 	// 	}),
			// 	// );
			// 	// Logger.debug(new Date().toLocaleDateString('es-ES', { timeZone: 'Europe/Madrid' }));
			// 	// Logger.debug('Es el mismo dia? ' + esMismoDia);
			// 	switch (dbStatus) {
			// 		case errorStatus.databaseFailed: {
			// 			// No imprimir de nuevo el error
			// 			return;
			// 		}
			// 		case itemStatus.newItemRegistered: {
			// 			if (!itsSameDay) return;
			// 			Logger.debug('The item ' + item.name + ' is the same day as today');
			// 			break;
			// 		}
			// 		case itemStatus.itemIsEqual: {
			// 			if (!itsSameDay) return;
			// 			Logger.debug('The item ' + item.name + ' is the same day as today');
			// 			// check if its already sent
			// 			const dbItemFromDB = await ItemModel.getItemByID({ id: item.id });
			// 			if (
			// 				dbItemFromDB === errorStatus.databaseFailed ||
			// 				dbItemFromDB === errorStatus.dataNotFound
			// 			)
			// 				return;

			// 			// mirar si hay due_date, si no hay significa que no se ha enviado
			// 			if (dbItemFromDB.due_today_msg_id) {
			// 				Logger.debug(`Mensaje ya enviado como ${dbItemFromDB.due_today_msg_id}`);
			// 				return;
			// 			}

			// 			// mirar si ya hay un mensaje de los items de hoy - conseguir la fecha de hoy
			// 			const today = new Date().toLocaleDateString('es-ES', { timeZone: 'Europe/Madrid' });

			// 			// conseguir el ultimo mensaje de discord y su contenido
			// 			const lastMessage = await (
			// 				client.channels.cache.get('1421809186395914330') as TextChannel
			// 			).messages.fetch({ limit: 1, cache: false });
			// 			const lastMessageContent = lastMessage.first()?.content;
			// 			Logger.debug('Last Message content', lastMessageContent);

			// 			// Mirar si el contenido del mensaje es el mismo que el de deberia haber hoy
			// 			if (lastMessageContent === `||@everyone||\n# ${today}`) {
			// 				await lastMessage.first()?.reply('pepe');
			// 				return;
			// 			}
			// 			// enviar mensaje en caso que sea el primer mensaje del dia
			// 			const dailyEmbed = todayItemEmbed(dbItem);
			// 			const msg = await (client.channels.cache.get('1421809186395914330') as TextChannel).send({
			// 				content: `||@everyone||\n# ${today}`,
			// 				embeds: [dailyEmbed],
			// 			});

			// 			// guadar id en la base de datos
			// 			await ItemModel.setItemDayMsgID({ id: item.id, dayMsgID: msg.id });
			// 			break;
			// 		}
			// 		case itemStatus.itemUpdated: {
			// 			if (!itsSameDay) return;
			// 			Logger.debug('The item ' + item.name + ' is the same day as today');
			// 			break;
			// 		}
			// 	}
		} catch (error) {
			console.log(error);
			Logger.error('Error parsing JSON from message:', error);
		}
	},
};

export default n8nApiEvent;
