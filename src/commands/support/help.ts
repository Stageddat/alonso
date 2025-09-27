import { CommandInteraction, SlashCommandBuilder } from 'discord.js';

const helpCommand = {
	data: new SlashCommandBuilder().setName('help').setDescription('Mostrar ayuda!'),
	async execute(interaction: CommandInteraction) {
		return interaction.reply('33');
	},
};

export default helpCommand;
