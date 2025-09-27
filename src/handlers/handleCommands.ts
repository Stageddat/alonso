import { commands } from 'src/commands/index.js';
import { Logger } from '../lib/logger.js';
import { errorEmbed } from 'src/views/generalEmbeds.js';
import { Interaction, MessageFlags } from 'discord.js';

type Command = (typeof commands)[keyof typeof commands];

export const handleCommandInteraction = async (interaction: Interaction) => {
	if (!interaction.isChatInputCommand()) return;

	const { commandName } = interaction;
	Logger.debug(`handling interaction for command: ${commandName}`);

	const command = (commands as Record<string, Command>)[commandName];
	if (!command) {
		Logger.warn(`command "${commandName}" not found.`);
		await interaction.reply({
			content: 'this command is not available!',
			flags: MessageFlags.Ephemeral,
		});
		return;
	}
	if (!command) {
		Logger.warn(`command "${commandName}" not found.`);
		await interaction.reply({
			content: 'this command is not available!',
			flags: MessageFlags.Ephemeral,
		});
		return;
	}

	try {
		Logger.debug(`executing command: ${commandName}`);
		await command.execute(interaction);
		Logger.debug(`command "${commandName}" executed successfully.`);
	} catch (error) {
		Logger.error(`error executing command "${commandName}":`, error);
		try {
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({
					embeds: [errorEmbed],
					flags: MessageFlags.Ephemeral,
				});
			} else {
				await interaction.reply({
					embeds: [errorEmbed],
					flags: MessageFlags.Ephemeral,
				});
			}
		} catch (e) {
			Logger.error('error sending error message:', e);
		}
	}
};
