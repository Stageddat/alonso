import { pb } from '@/lib/db';
import { Logger } from '@/lib/logger';
import { ClientResponseError } from 'pocketbase';
import { errorStatus } from '@/enum/errorStatus';
import { DbItem } from '@/types/dbItem';
import equal from 'fast-deep-equal';
import { itemStatus } from '@/enum/itemStatus';
import { DateTime } from 'luxon';
import { normalizeToUTC } from '@/utils/normalizeToUTC';

type DbStoredItem = DbItem & {
	collectionId?: string;
	collectionName?: string;
	created?: string;
	updated?: string;
	dm_msg_id?: string | null;
	due_today_msg_id?: string;
	week_msg_id?: string;
};

export class ItemModel {
	private static normalizeItem(item: DbStoredItem | DbItem): DbItem {
		return {
			id: item.id,
			title: item.title,
			moodle_link: item.moodle_link,
			notion_link: item.notion_link,
			users_completed: item.users_completed ?? undefined,
			due_date: normalizeToUTC(item.due_date),
			item_type: item.item_type,
			course: item.course,
		};
	}

	static async addModifyItem({ item }: { item: DbItem }) {
		try {
			const currentItem = await ItemModel.getItemByID({ id: item.id.trim() });
			if (currentItem === errorStatus.databaseFailed) return errorStatus.databaseFailed;

			if (currentItem === itemStatus.itemSavedBdErrorFirstSync) {
				const newItem = await pb.collection('dam_items').create(item);
				Logger.info(`New item registered because it was not found: ${newItem.id}`);
				return itemStatus.newItemRegistered;
			}

			const normalizedCurrent = ItemModel.normalizeItem(currentItem);
			const normalizedNew = ItemModel.normalizeItem(item);

			// console.log('Current item (normalized):', normalizedCurrent);
			// console.log('New item (normalized):', normalizedNew);
			// console.log('Are equal:', equal(normalizedCurrent, normalizedNew));

			if (equal(normalizedCurrent, normalizedNew)) {
				// console.log('No changes detected, skipping update');
				// console.log('Current item:', currentItem);
				return itemStatus.itemIsEqual;
			}

			const updatedItem = await pb.collection('dam_items').update<DbStoredItem>(item.id, item);
			Logger.info(`Item updated: ${updatedItem.id}`);
			return itemStatus.itemUpdated;
		} catch (error) {
			Logger.error('Failed to update or create item:', error);
			return errorStatus.databaseFailed;
		}
	}

	static async getItemByID({ id }: { id: string }) {
		try {
			const item = await pb.collection('dam_items').getOne<DbStoredItem>(id);
			Logger.debug(`Item fetched: ${item.id}`);
			Logger.debug(item);
			return item;
		} catch (error: unknown) {
			if (error instanceof ClientResponseError) {
				if (error.status === 404) {
					Logger.debug('Item not found (expected on first search):', id);
					return itemStatus.itemSavedBdErrorFirstSync;
				}
				Logger.error('ERROR GETTING ITEM:', error.originalError);
				Logger.error('ERROR GETTING ITEM:', error);
				return errorStatus.databaseFailed;
			}
			Logger.error('Database error:', error);
			return errorStatus.databaseFailed;
		}
	}

	static async setItemDayMsgID({ id, dayMsgID }: { id: string; dayMsgID: string }) {
		try {
			const item = await pb.collection('dam_items').update(id, { due_today_msg_id: dayMsgID });
			return item;
		} catch (error) {
			Logger.error("Failed to update item's day message ID:", error);
			return errorStatus.databaseFailed;
		}
	}

	static async getTodayItems() {
		try {
			const todayDate = DateTime.now().setZone('Europe/Madrid').toUTC().toFormat('yyyy-MM-dd');
			const start = DateTime.fromISO(todayDate, { zone: 'Europe/Madrid' }).startOf('day');
			const end = start.endOf('day');

			const startUTC = start.toUTC().toFormat('yyyy-LL-dd HH:mm:ss');
			const endUTC = end.toUTC().toFormat('yyyy-LL-dd HH:mm:ss');

			const filter = `due_date >= "${startUTC}" && due_date <= "${endUTC}"`;

			const itemList = await pb.collection('dam_items').getList<DbStoredItem>(1, 50, {
				filter,
				sort: 'due_date',
			});
			return itemList.items;
		} catch (error) {
			Logger.error("Failed to get today's items:", error);
			return errorStatus.databaseFailed;
		}
	}
}
