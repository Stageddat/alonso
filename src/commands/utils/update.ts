import { CommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { superUsers } from '@/config/superUsers.js';
import { notAllowedEmbed } from '@/views/generalEmbeds.js';
import { updateDailyMsg } from '@/controllers/updateDailyMsg';

const updateCommand = {
	data: new SlashCommandBuilder().setName('update').setDescription('update daily and weekly msgs'),
	async execute(interaction: CommandInteraction) {
		if (!superUsers.includes(interaction.user.id)) {
			return interaction.reply({
				embeds: [notAllowedEmbed],
				flags: MessageFlags.Ephemeral,
				withResponse: true,
			});
		}

		await interaction.deferReply({ ephemeral: true });

		await updateDailyMsg.updateDayMsg();
		return interaction.editReply({
			content: 'dia actualizado',
		});
	},
};

export default updateCommand;
