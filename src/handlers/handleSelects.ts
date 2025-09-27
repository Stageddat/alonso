/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { AnySelectMenuInteraction } from 'discord.js';
import path from 'node:path';
import fs from 'node:fs';
import { Logger } from '../lib/logger.js';
import { errorEmbed } from 'src/views/generalEmbeds.js';

function findSelectFile(dirs: string[], selectId: string): string | null {
	Logger.debug(`Searching for select menu handler '${selectId}' in directories:`);
	dirs.forEach((dir) => Logger.debug(dir));

	const baseSelectId = selectId.split(':')[0];

	for (const dir of dirs) {
		if (!fs.existsSync(dir)) {
			Logger.debug(`Directory does not exist: ${dir}`);
			continue;
		}
		if (!fs.statSync(dir).isDirectory()) {
			Logger.debug(`Path is not a directory: ${dir}`);
			continue;
		}
		try {
			const files = fs.readdirSync(dir, { withFileTypes: true });
			for (const file of files) {
				const fullPath = path.join(dir, file.name);
				if (file.isDirectory()) {
					const found = findSelectFile([fullPath], selectId);
					if (found) return found;
				} else if (
					file.isFile() &&
					(file.name === `${baseSelectId}.ts` || file.name === `${baseSelectId}.js`)
				) {
					return fullPath;
				}
			}
		} catch (error) {
			Logger.error(`Error scanning directory ${dir}:`, error);
		}
	}
	return null;
}

export const handleSelectInteraction = async (interaction: AnySelectMenuInteraction) => {
	const selectId = interaction.customId;
	Logger.debug(`Handling select menu interaction: ${selectId}`);

	try {
		// Define the directories where select menu handlers are stored.
		const potentialSelectDirs = [
			path.join(process.cwd(), 'src', 'selects'),
			path.join(process.cwd(), 'selects'),
		];

		const uniqueDirs = [...new Set(potentialSelectDirs)].filter((dir) => typeof dir === 'string');

		const selectPath = findSelectFile(uniqueDirs, selectId);
		if (!selectPath) {
			Logger.warn(`Select menu handler "${selectId}" not found. Attempted directories:`);
			uniqueDirs.forEach((dir) => Logger.warn(dir));
			await interaction.reply({
				embeds: [errorEmbed],
				ephemeral: true,
			});
			return;
		}

		Logger.debug(`Select menu handler path found: ${selectPath}`);

		const selectModule = await import(`file://${selectPath}`);
		const selectHandler = selectModule.default?.default || selectModule.default || selectModule;

		if (!selectHandler || !selectHandler.execute) {
			Logger.warn(`Invalid select menu handler "${selectId}".`);
			await interaction.reply({
				content: 'This select menu action is not available!',
				ephemeral: true,
			});
			return;
		}

		Logger.debug(`Executing select menu handler: ${selectId}`);
		await selectHandler.execute(interaction);
		Logger.debug(`Select menu handler "${selectId}" executed successfully.`);
	} catch (error) {
		Logger.error(`Error executing select menu handler "${selectId}":`, error);
		try {
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({
					embeds: [errorEmbed],
					ephemeral: true,
				});
			} else {
				await interaction.reply({
					embeds: [errorEmbed],
					ephemeral: true,
				});
			}
		} catch (e) {
			Logger.error('Error sending error message:', e);
		}
	}
};
