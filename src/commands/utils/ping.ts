import {
	CommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from 'discord.js';

const pingCommand = {
	data: new SlashCommandBuilder().setName('ping').setDescription('ping me :3!'),
	async execute(interaction: CommandInteraction) {
		const apiLatency = interaction.client.ws.ping;

		const startTime = Date.now();

		await interaction.reply({ content: 'poong!', withResponse: true });
		const botLatency = Date.now() - startTime;
		const pingEmbed = new EmbedBuilder()
			.setColor(0x0099ff)
			.setTitle('ping latency')
			.setDescription(
				`bot latency: ${botLatency}ms\napi latency: ${apiLatency}ms`,
			);

		await interaction.editReply({ content: 'poong!', embeds: [pingEmbed] });
	},
};

export default pingCommand;
