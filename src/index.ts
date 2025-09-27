import { CustomClient } from './lib/customClient.js';
import { Events } from 'discord.js';
import { handleInteraction } from './handlers/handleInteractions.js';
import { env } from './lib/env.js';
import { loadEvents } from './handlers/handleEvents.js';
import { Logger } from './lib/logger.js';
import { statusQuotes } from './config/statusQuotes.js';

const client = new CustomClient();

client.on(Events.InteractionCreate, (interaction) => {
	void handleInteraction(interaction);
});

client.once(Events.ClientReady, () => {
	Logger.info(`${client.user?.tag} está listo para conseguir la 33`);

	if (client.user) {
		client.user.setActivity(statusQuotes[Math.floor(Math.random() * statusQuotes.length)], {
			type: 4,
		});

		setInterval(
			() => {
				const randomIndex = Math.floor(Math.random() * statusQuotes.length);
				client.user?.setActivity(statusQuotes[randomIndex], { type: 4 });
			},
			15 * 60 * 1000,
		);
	}
});

loadEvents(client);

console.log('Logging...');
client.login(env.DISCORD_TOKEN).catch((err) => {
	console.error('Failed to login:', err);
	process.exit(1);
});
