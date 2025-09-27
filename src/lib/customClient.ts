import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { Command } from '../types/command';

export class CustomClient extends Client {
	public commands: Collection<string, Command>;

	constructor() {
		super({
			intents: [
				GatewayIntentBits.Guilds,
				GatewayIntentBits.GuildMessages,
				GatewayIntentBits.MessageContent,
				GatewayIntentBits.GuildMembers,
				GatewayIntentBits.GuildVoiceStates,
				GatewayIntentBits.GuildPresences,
				GatewayIntentBits.GuildMessageReactions,
				GatewayIntentBits.GuildIntegrations,
				GatewayIntentBits.GuildWebhooks,
				GatewayIntentBits.GuildVoiceStates,
				GatewayIntentBits.GuildPresences,
				GatewayIntentBits.GuildMessageReactions,
				GatewayIntentBits.GuildIntegrations,
				GatewayIntentBits.GuildInvites,
				GatewayIntentBits.DirectMessages,
			],
		});
		this.commands = new Collection<string, Command>();
	}
}
