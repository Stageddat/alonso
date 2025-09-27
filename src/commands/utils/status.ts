import { CommandInteraction, EmbedBuilder, MessageFlags, SlashCommandBuilder } from 'discord.js';
import { env } from '../../lib/env.js';
import os from 'os';
import process from 'process';
import { superUsers } from '@/config/superUsers.js';
import { notAllowedEmbed } from '@/views/generalEmbeds.js';

const statusCommand = {
	data: new SlashCommandBuilder()
		.setName('status')
		.setDescription('See detailed server & bot status'),
	async execute(interaction: CommandInteraction) {
		if (!superUsers.includes(interaction.user.id)) {
			return interaction.reply({
				embeds: [notAllowedEmbed],
				flags: MessageFlags.Ephemeral,
				withResponse: true,
			});
		}
		const apiLatency = interaction.client.ws.ping;

		const startTime = Date.now();
		await interaction.reply({ content: 'Calculating status...', ephemeral: true });
		const botLatency = Date.now() - startTime;

		// OS info
		const networkInterfaces = os.networkInterfaces();
		const ipAddress =
			networkInterfaces?.eth0?.[0]?.address ||
			networkInterfaces?.en0?.[0]?.address ||
			'not available';
		const totalMemGB = (os.totalmem() / 1024 ** 3).toFixed(2);
		const freeMemGB = (os.freemem() / 1024 ** 3).toFixed(2);
		const usedMemGB = (parseFloat(totalMemGB) - parseFloat(freeMemGB)).toFixed(2);

		// CPU info
		const cpus = os.cpus();
		const cpuModel = cpus[0]?.model || 'Unknown';
		const cpuCores = cpus.length;
		const cpuSpeed = cpus[0]?.speed || 0;

		// Uptime
		const botUptime = process.uptime();
		const serverUptime = os.uptime();
		const formatUptime = (seconds: number) => {
			const d = Math.floor(seconds / (3600 * 24));
			const h = Math.floor((seconds % (3600 * 24)) / 3600);
			const m = Math.floor((seconds % 3600) / 60);
			const s = Math.floor(seconds % 60);
			return `${d}d ${h}h ${m}m ${s}s`;
		};

		// Process info
		const nodeVersion = process.version;
		const processId = process.pid;
		const memoryUsageMB = (process.memoryUsage().rss / 1024 ** 2).toFixed(2);

		// Discord info
		const guildCount = interaction.client.guilds.cache.size;
		const userCount = interaction.client.users.cache.size;

		const statusEmbed = new EmbedBuilder()
			.setColor(0x0099ff)
			.setTitle('Server & Bot Status')
			.setDescription(
				`**Bot latency:** ${botLatency}ms\n**API latency:** ${apiLatency}ms\n**Environment:** ${env.NODE_ENV}`,
			)
			.addFields(
				{ name: 'Network', value: `IP: ${ipAddress}` },
				{
					name: 'Operating System',
					value: `${os.platform()} ${os.release()} (${os.type()})\nServer uptime: ${formatUptime(serverUptime)}`,
				},
				{
					name: 'CPU',
					value: `${cpuModel}\nCores: ${cpuCores}\nSpeed: ${cpuSpeed} MHz`,
				},
				{
					name: 'Memory',
					value: `Used: ${usedMemGB} GB / Total: ${totalMemGB} GB\nFree: ${freeMemGB} GB\nProcess memory: ${memoryUsageMB} MB`,
				},
				{
					name: 'Node & Process',
					value: `Node.js: ${nodeVersion}\nProcess ID: ${processId}\nBot uptime: ${formatUptime(botUptime)}`,
				},
				{ name: 'Discord', value: `Guilds: ${guildCount}\nUsers: ${userCount}` },
			)
			.setTimestamp();

		await interaction.editReply({
			content: 'Status calculated!',
			embeds: [statusEmbed],
		});
	},
};

export default statusCommand;
