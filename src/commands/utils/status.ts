import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { env } from '../../lib/env.js';
import os from 'os';

const statusCommand = {
	data: new SlashCommandBuilder().setName('status').setDescription('see server status'),
	async execute(interaction: CommandInteraction) {
		const apiLatency = interaction.client.ws.ping;

		const startTime = Date.now();

		await interaction.reply({ content: 'bling bling!', withResponse: true });
		const botLatency = Date.now() - startTime;
		const statusEmbed = new EmbedBuilder()
			.setColor(0x0099ff)
			.setTitle('server status')
			.setDescription(
				`bot latency: ${botLatency}ms\napi latency: ${apiLatency}ms\nrunning on: ${env.NODE_ENV}\n` +
					`ip: ${os.networkInterfaces()?.eth0?.[0].address || 'not available'}\n` +
					`os: ${os.platform()} ${os.release()}\n` +
					`cpu: ${os.cpus().length} cores\n` +
					`memory: ${(os.totalmem() / 1024 ** 3).toFixed(2)} GB RAM`,
			);

		await interaction.editReply({
			content: 'BANG BANG!',
			embeds: [statusEmbed],
		});
	},
};

export default statusCommand;
