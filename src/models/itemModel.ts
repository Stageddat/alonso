import { pb } from '@/lib/db';
import { Logger } from '@/lib/logger';
import { ClientResponseError } from 'pocketbase';
import { errorStatus } from '@/enum/errorStatus';
import { DbItem } from '@/types/dbItem';
import equal from 'fast-deep-equal';
import { itemStatus } from '@/enum/itemStatus';

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
		const normalizedDueDate = item.due_date ? new Date(item.due_date).toISOString() : '';
		return {
			id: item.id,
			title: item.title,
			moodle_link: item.moodle_link,
			notion_link: item.notion_link,
			users_completed: item.users_completed ?? undefined,
			due_date: normalizedDueDate,
			item_type: item.item_type,
			course: item.course,
		};
	}

	static async addModifyItem({ item }: { item: DbItem }) {
		try {
			const currentItem = await ItemModel.getItemByID({ id: item.id });
			if (currentItem === errorStatus.databaseFailed) return errorStatus.databaseFailed;

			if (currentItem === errorStatus.dataNotFound) {
				const newItem = await pb.collection('dam_items').create(item);
				Logger.info(`New item registered: ${newItem.id}`);
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

			const updatedItem = await pb.collection('dam_items').update(item.id, item);
			Logger.info(`Item updated: ${updatedItem.id}`);
			return itemStatus.itemUpdated;
		} catch (error) {
			Logger.error(error);
			return errorStatus.databaseFailed;
		}
	}

	static async getItemByID({ id }: { id: string }) {
		try {
			const item = await pb.collection('dam_items').getOne(id);
			Logger.debug(`Item fetched: ${item.id}`);
			Logger.debug(item);
			return item as DbStoredItem;
		} catch (error: unknown) {
			console.error(error);
			if (error instanceof ClientResponseError) {
				if (error.status === 404) {
					return errorStatus.dataNotFound;
				}
				Logger.error(error.originalError);
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
			Logger.error(error);
			return errorStatus.databaseFailed;
		}
	}
}
