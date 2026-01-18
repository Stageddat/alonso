import { CommandInteraction, SlashCommandBuilder } from 'discord.js';

const ayudaCommand = {
	data: new SlashCommandBuilder().setName('ayuda').setDescription('Mostrar ayuda!'),
	async execute(interaction: CommandInteraction) {
		return interaction.reply('nidea bro, pregunta a marc :p');
	},
};

export default ayudaCommand;
