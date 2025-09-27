/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ButtonInteraction } from 'discord.js';
import path from 'node:path';
import fs from 'node:fs';
import { Logger } from '../lib/logger.js';
import { errorEmbed } from '../views/generalEmbeds.js';

// this shit works somehow, idk why

function findButtonFile(dirs: string[], buttonId: string): string | null {
	Logger.debug(`Searching for button handler '${buttonId}' in directories:`);
	dirs.forEach((dir) => Logger.debug(dir));

	const baseButtonId = buttonId.split(':')[0];

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
					const found = findButtonFile([fullPath], buttonId);
					if (found) return found;
				} else if (
					file.isFile() &&
					(file.name === `${baseButtonId}.ts` || file.name === `${baseButtonId}.js`)
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

export const handleButtonInteraction = async (interaction: ButtonInteraction) => {
	const buttonId = interaction.customId;
	Logger.debug(`Handling button interaction: ${buttonId}`);

	try {
		const potentialButtonDirs = [
			path.join(process.cwd(), 'src', 'buttons'),
			path.join(process.cwd(), 'buttons'),
		];

		const uniqueDirs = [...new Set(potentialButtonDirs)].filter(
			(dir) => dir && typeof dir === 'string',
		);

		const buttonPath = findButtonFile(uniqueDirs, buttonId);

		if (!buttonPath) {
			Logger.warn(`Button handler "${buttonId}" not found. Attempted directories:`);
			uniqueDirs.forEach((dir) => Logger.warn(dir));

			await interaction.reply({
				embeds: [errorEmbed],
				ephemeral: true,
			});
			return;
		}

		Logger.debug(`Button handler path found: ${buttonPath}`);

		const buttonModule = await import(`file://${buttonPath}`);
		Logger.debug(`Button module loaded: ${JSON.stringify(Object.keys(buttonModule))}`);

		const buttonHandler = buttonModule.default?.default || buttonModule.default || buttonModule;

		Logger.debug(
			`Button handler extracted from module: ${JSON.stringify(Object.keys(buttonHandler))}`,
		);

		if (!buttonHandler || !buttonHandler.execute) {
			Logger.warn(`Invalid button handler "${buttonId}".`);
			await interaction.reply({
				content: 'This button action is not available!',
				ephemeral: true,
			});
			return;
		}

		Logger.debug(`Executing button handler: ${buttonId}`);
		await buttonHandler.execute(interaction);
		Logger.debug(`Button handler "${buttonId}" executed successfully.`);
	} catch (error) {
		Logger.error(`Error executing button handler "${buttonId}":`, error);
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
