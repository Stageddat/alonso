import { Events, Message } from 'discord.js';
import { Logger } from '@/lib/logger.js';
import { courses } from '@/config/courses';
import { Item } from '@/types/item';
import { itemType } from '@/config/itemType';

const n8nApiEvent = {
	name: Events.MessageCreate,
	once: false,
	async execute(message: Message) {
		if (message.author.id !== '1421265168569991328' && message.channel.id !== '1421265117273915513')
			return;

		const text = message.content;

		const clearText = text.replace(/^```|```$/g, '');

		try {
			const item: Item = JSON.parse(clearText) as Item;
			const prettyJSON = JSON.stringify(item, null, 2);
			await message.reply('```json\n' + prettyJSON + '\n```');
			Logger.debug(`message received: ${message.content}`);
			Logger.debug(`parsed JSON: ${JSON.stringify(item, null, 2)}`);
			Logger.info(`name: ${item.name}`);
			Logger.info(`url: ${item.url}`);
			Logger.info(`ends at: ${item.property_fecha_l_mite.start}`);

			const course = courses.find((c) => c.id === item.property_curso[0]);
			const type = itemType.find((c) => c.id === item.property_tipo[0]);

			if (course && type) {
				Logger.info(`course: ${course.property_nombre_completo}`);
				Logger.info(`tutor: ${course.property_tutor}`);
				Logger.info(`aula: ${course.property_aula}`);
				Logger.info(`type: ${type.name}`);
			} else {
				Logger.warn(`Course not found for ID: ${item.property_curso[0]}`);
			}
		} catch (error) {
			Logger.error('Error parsing JSON from message:', error);
		}
	},
};

export default n8nApiEvent;
