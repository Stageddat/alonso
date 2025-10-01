import { dateStatus } from '@/enum/dateStatus';
import { errorStatus } from '@/enum/errorStatus';
import { pb } from '@/lib/db';
import { Logger } from '@/lib/logger';
import { DateTime } from 'luxon';
import { ClientResponseError } from 'pocketbase';

type DbStoredMsg = {
	collectionId: string;
	collectionName: string;
	created: string;
	daily_msg_id: string;
	id: string;
	updated: string;
	weekly_msg_id: string;
};

export class MsgModel {
	static async getMsgIds() {
		try {
			const todayDate = DateTime.now().setZone('Europe/Madrid').toUTC().toFormat('yyyy-MM-dd');
			Logger.debug("Today's date:", todayDate);
			const todayMsgIds = await pb
				.collection('dam_msg')
				.getFirstListItem<DbStoredMsg>(`id="${todayDate}"`);
			// const records = await pb.collection('dam_msg').getFullList({});
			Logger.debug('Today msg id:', todayMsgIds.daily_msg_id);
			Logger.debug("Today's date:", todayMsgIds);
			// console.log(records);
			return todayMsgIds;
		} catch (error: unknown) {
			if (error instanceof ClientResponseError) {
				if (error.status === 404) {
					Logger.debug('Date messages ids not found for today');
					return dateStatus.dateNotFound;
				}
			}
			Logger.error('Database error:', error);
			return errorStatus.databaseFailed;
		}
	}

	static async addDate() {
		try {
			const todayDate = DateTime.now().setZone('Europe/Madrid').toUTC().toFormat('yyyy-MM-dd');
			Logger.debug("Today's date:", todayDate);
			const todayMsgIds = await pb
				.collection('dam_msg')
				.create({ id: todayDate, daily_msg_id: undefined, weekly_msg_id: undefined });
			// const records = await pb.collection('dam_msg').getFullList({});
			Logger.debug("Day's date added:", todayMsgIds.id);
			// console.log(records);
			return dateStatus.dateAdded;
		} catch (error: unknown) {
			if (error instanceof ClientResponseError) {
				if (error.status === 404) {
					Logger.debug('Date messages ids not found for today (expected on first sync)');
					return dateStatus.dateNotFound;
				}
			}
			Logger.error('Database error:', error);
			return errorStatus.databaseFailed;
		}
	}
}
