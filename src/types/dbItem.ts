export interface DbItem {
	id: string;
	title: string;
	moodle_link?: string;
	notion_link: string;
	users_completed?: string;
	due_date: string;
	item_type: string;
	course: string;
	due_today_msg_id?: string;
	week_msg_id?: string;
	dm_msg_id?: string;
}
