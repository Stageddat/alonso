/* eslint-disable no-unused-vars */
import { CustomClient } from '@/lib/customClient.js';
import { events } from '@/events/index.js';
import { Logger } from '@/lib/logger.js';
import { ClientEvents } from 'discord.js';

type Event<K extends keyof ClientEvents> = {
	name: K;
	once: boolean;
	execute: (...args: ClientEvents[K]) => void;
};

export const loadEvents = (client: CustomClient) => {
	Logger.debug('loading events...');
	for (const [eventName, event] of Object.entries(events)) {
		const typedEvent = event as Event<keyof ClientEvents>;

		if (typedEvent.once) {
			client.once(typedEvent.name, (..._args) => typedEvent.execute(..._args));
		} else {
			client.on(typedEvent.name, (..._args) => typedEvent.execute(..._args));
		}

		Logger.debug(`event "${eventName}" loaded successfully.`);
	}
	Logger.debug(`loaded ${Object.keys(events).length} events.`);
};
