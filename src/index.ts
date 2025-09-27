import { CustomClient } from './lib/customClient.js';
import { Events } from 'discord.js';
import { handleInteraction } from './handlers/handleInteractions.js';
import { env } from './lib/env.js';
import { loadEvents } from './handlers/handleEvents.js';
import { Logger } from './lib/logger.js';

const client = new CustomClient();

client.on(Events.InteractionCreate, (interaction) => {
	void handleInteraction(interaction);
});

client.once(Events.ClientReady, () => {
	Logger.info(`${client.user?.tag} está listo para conseguir la 33`);

	if (client.user) {
		client.user.setActivity('La 33 llegará', { type: 4 });
	}
});

loadEvents(client);

console.log('Logging...');
client.login(env.DISCORD_TOKEN).catch((err) => {
	console.error('Failed to login:', err);
	process.exit(1);
});
