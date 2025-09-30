import { CommandInteraction, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { superUsers } from '@/config/superUsers.js';
import { notAllowedEmbed } from '@/views/generalEmbeds.js';
// import { MsgModel } from '@/models/msgModel';

const testCommand = {
	data: new SlashCommandBuilder().setName('test').setDescription('say gex'),
	async execute(interaction: CommandInteraction) {
		if (!superUsers.includes(interaction.user.id)) {
			return interaction.reply({
				embeds: [notAllowedEmbed],
				flags: MessageFlags.Ephemeral,
				withResponse: true,
			});
		}

		// const item = await ItemModel.getItemByID({ id: 'iwrfhqtk2577a9' });
		// return interaction.reply({ content: `\`\`\`json\n${JSON.stringify(item, null, 2)}\n\`\`\`` });

		// const item = await ItemModel.getTodayItems();
		// return interaction.reply({ content: `\`\`\`json\n${JSON.stringify(item, null, 2)}\n\`\`\`` });

		// const todayMsgId = await MsgModel.getTodayMsgId();
		// return interaction.reply({
		// 	content: `\`\`\`json\n${JSON.stringify(todayMsgId, null, 2)}\n\`\`\``,
		// });
	},
};

export default testCommand;
