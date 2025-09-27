import { handleButtonInteraction } from './handleButtons.js';
import { handleSelectInteraction } from './handleSelects.js';
import { handleCommandInteraction } from './handleCommands.js';
import { Interaction } from 'discord.js';

export const handleInteraction = async (interaction: Interaction) => {
	if (interaction.isChatInputCommand()) {
		await handleCommandInteraction(interaction);
	} else if (interaction.isButton()) {
		await handleButtonInteraction(interaction);
	} else if (interaction.isStringSelectMenu()) {
		await handleSelectInteraction(interaction);
	}
};
