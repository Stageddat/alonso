import { errorStatus } from '@/enum/errorStatus';
import { Logger } from '@/lib/logger';
import { ItemModel } from '@/models/itemModel';
import { MsgIdsModel } from '@/models/msgModel';
import { lastUpdatedEmbed, nothingForTodayEmbed, todayItemEmbed } from '@/views/todayItemEmbeds';
import { client } from '@/index';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	TextChannel,
} from 'discord.js';
import { DateTime } from 'luxon';
import { dateStatus } from '@/enum/dateStatus';

export class updateDailyMsg {
	private static async sendDayMsg(embedList: EmbedBuilder[], formattedTodayDate: string) {
		try {
			const weekDay = DateTime.now()
				.setZone('Europe/Madrid')
				.setLocale('es')
				.toLocaleString({ weekday: 'long' });

			const msgData = await (client.channels.cache.get('1421809186395914330') as TextChannel).send({
				content: `# ${weekDay.charAt(0).toUpperCase() + weekDay.slice(1)}, ${formattedTodayDate}`,
				embeds: embedList,
			});
			return msgData.id;
		} catch (error) {
			Logger.error('Failed to send today message:', error);
			return dateStatus.failedToSendTodayDate;
		}
	}

	public static async updateDayMsg() {
		Logger.debug("Updating today's message...");
		// coger todo los items de hoy
		const todayItemList = await ItemModel.getTodayItems();
		Logger.debug('Today items:', todayItemList);
		if (todayItemList === errorStatus.databaseFailed) {
			return;
		}

		const embedList = [];

		// Filtrar items enviadoscon los que no
		for (const item of todayItemList) {
			if (item.due_today_msg_id) {
				Logger.info(`Item already sent: ${item.id}`);
			} else if (!item.due_today_msg_id) {
				Logger.info(`Item not sent: ${item.id}`);
			}

			// crear embed con el item
			const itemEmbed = todayItemEmbed(item);
			// listar embed
			embedList.push(itemEmbed);
		}

		// añadir embed de chilling en caso que no hay nada
		if (embedList.length === 0) {
			embedList.push(nothingForTodayEmbed());
		}
		embedList.push(lastUpdatedEmbed());
		const agendaLinkButton = new ButtonBuilder()
			.setLabel('Agenda completa')
			.setURL('https://agenda.stageddat.dev')
			.setEmoji('📅')
			.setStyle(ButtonStyle.Link);
		const row = new ActionRowBuilder<ButtonBuilder>().addComponents(agendaLinkButton);
		// mirar si existe mensaje de hoy
		const todayMsgId = await MsgIdsModel.getMsgIds();

		const todayDate = DateTime.now().setZone('Europe/Madrid').toFormat('yyyy-MM-dd');
		const formattedTodayDate = DateTime.now().setZone('Europe/Madrid').toFormat('dd/MM/yyyy');
		const weekDay = DateTime.now()
			.setZone('Europe/Madrid')
			.setLocale('es')
			.toLocaleString({ weekday: 'long' });

		if (todayMsgId === errorStatus.databaseFailed) {
			Logger.error("Failed to get today's message ID.");
			return;
		}

		if (todayMsgId === dateStatus.dateNotFound) {
			Logger.info('Date not in db, creating and sending...');
			await MsgIdsModel.addDate();
			const messageId = await this.sendDayMsg(embedList, formattedTodayDate);
			await MsgIdsModel.setDate({
				id: todayDate,
				dailyMsgId: messageId,
			});
			return;
		}

		if (todayMsgId.daily_msg_id === '') {
			// Mensaje no enviado! Hay que enviar el mensaje!
			Logger.info("Today's message not sent. Sending...");
			const messageId = await this.sendDayMsg(embedList, formattedTodayDate);
			await MsgIdsModel.setDate({
				id: todayDate,
				dailyMsgId: messageId,
			});
			return;
		}

		await (
			await (client.channels.cache.get('1421809186395914330') as TextChannel).messages.fetch(
				todayMsgId.daily_msg_id,
			)
		).edit({
			content: `# ${weekDay.charAt(0).toUpperCase() + weekDay.slice(1)}, ${formattedTodayDate}`,
			embeds: embedList,
			components: [row],
		});
	}
}
