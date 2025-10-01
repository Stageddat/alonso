import { errorStatus } from '@/enum/errorStatus';
import { Logger } from '@/lib/logger';
import { ItemModel } from '@/models/itemModel';
import { MsgModel } from '@/models/msgModel';
import { todayItemEmbed } from '@/views/todayItemEmbeds';
import { client } from '@/index';
import { EmbedBuilder, TextChannel } from 'discord.js';
import { DateTime } from 'luxon';
import { dateStatus } from '@/enum/dateStatus';

export class updateDailyMsg {
	private static async sendDayMsg(embedList: EmbedBuilder[], todayDate: string) {
		await (client.channels.cache.get('1421809186395914330') as TextChannel).send({
			content: todayDate,
			embeds: embedList,
		});
	}

	public static async updateDayMsg() {
		// coger todo los items de hoy
		const todayItemList = await ItemModel.getTodayItems();

		if (todayItemList === errorStatus.databaseFailed) {
			Logger.error("Failed to get today's items.");
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

		// mirar si existe mensaje de hoy
		const todayMsgId = await MsgModel.getMsgIds();

		const todayDate = DateTime.now().setZone('Europe/Madrid').toUTC().toFormat('yyyy-MM-dd');

		if (todayMsgId === errorStatus.databaseFailed) {
			Logger.error("Failed to get today's message ID.");
			return;
		}

		if (todayMsgId === dateStatus.dateNotFound) {
			await MsgModel.addDate();
			await this.sendDayMsg(embedList, todayDate);
			return;
		}

		if (todayMsgId.daily_msg_id === '') {
			// Mensaje no enviado! Hay que enviar el mensaje!
			await this.sendDayMsg(embedList, todayDate);
			Logger.info("Today's message not sent.");
			return;
		}

		await (
			await (client.channels.cache.get('1421809186395914330') as TextChannel).messages.fetch(
				todayMsgId.daily_msg_id,
			)
		).edit({
			embeds: embedList,
		});
	}
}
