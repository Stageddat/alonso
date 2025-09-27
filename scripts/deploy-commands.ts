/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable indent */
import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';
import prompts from 'prompts';
import dotenv from 'dotenv';

dotenv.config();

const env = {
	DISCORD_TOKEN: process.env.DISCORD_TOKEN,
	DISCORD_APP_ID: process.env.DISCORD_APP_ID,
	DISCORD_GUILD_ID: process.env.DISCORD_GUILD_ID,
};

interface SlashCommand {
	permissions?: string;
}

interface SlashCommandConfig {
	name: string;
	description: string;
	options?: SlashCommandOptionConfig[];
	nsfw?: boolean;
}

interface SlashCommandOptionConfig {
	type: string;
	name: string;
	description: string;
	required?: boolean;
	choices?: { name: string; value: string | number }[];
	minValue?: number;
	maxValue?: number;
}

interface Command {
	id: string;
	name: string;
	description: string;
}

interface Choice {
	title: string;
	value: string;
}

async function loadSlashCommands(): Promise<Record<string, SlashCommandBuilder>> {
	const slashCommands: Record<string, SlashCommandBuilder> = {};
	const slashDir = path.join(process.cwd(), 'src/commands');

	try {
		const slashDirFiles = fs.readdirSync(slashDir, { recursive: true });
		const slashCommandFiles = slashDirFiles
			.filter((file) => file.toString().endsWith('.ts'))
			.map((file) => path.join(slashDir, file.toString()));

		for (const filePath of slashCommandFiles) {
			try {
				// Use dynamic import with file:// protocol for local files
				const fileURL = `file://${filePath.replace(/\\/g, '/')}`;
				const commandModule = await import(fileURL);

				if (!commandModule.default || !commandModule.default.data) {
					console.log(`[WARNING] the command ${filePath} is missing the 'data' property.`);
					continue;
				}

				const commandBuilder = commandModule.default.data;
				if (!(commandBuilder instanceof SlashCommandBuilder)) {
					console.log(`[WARNING] 'data' in ${filePath} is not a valid SlashCommandBuilder.`);
					continue;
				}

				slashCommands[commandBuilder.name] = commandBuilder;
			} catch (error) {
				console.error(`failed to load slash command ${filePath}:`, error);
			}
		}
	} catch (error) {
		console.error('failed to load slash commands:', error);
	}

	return slashCommands;
}

function buildSlashCommand(config: SlashCommandConfig, command: SlashCommand): SlashCommandBuilder {
	const commandBuilder = new SlashCommandBuilder();
	commandBuilder.setName(config.name);
	commandBuilder.setDescription(config.description);
	if (command.permissions) {
		commandBuilder.setDefaultMemberPermissions(command.permissions);
	}
	if (config.nsfw) commandBuilder.setNSFW(config.nsfw);

	if (config.options) {
		addCommandOptions(commandBuilder, config.options);
	}

	return commandBuilder;
}

function addCommandOptions(
	commandBuilder: SlashCommandBuilder,
	options: SlashCommandOptionConfig[],
) {
	options.forEach((option) => {
		switch (option.type) {
			case 'STRING':
				commandBuilder.addStringOption((opt) => {
					setGenericOptionInfo(opt, option);
					if (option.choices) {
						opt.addChoices(...(option.choices as { name: string; value: string }[]));
					}
					return opt;
				});
				break;
			case 'INTEGER':
				commandBuilder.addIntegerOption((opt) => {
					setGenericOptionInfo(opt, option);
					if (option.choices) {
						opt.addChoices(...(option.choices as { name: string; value: number }[]));
					}
					if (option.minValue) opt.setMinValue(option.minValue);
					if (option.maxValue) opt.setMaxValue(option.maxValue);
					return opt;
				});
				break;
			case 'NUMBER':
				commandBuilder.addNumberOption((opt) => {
					setGenericOptionInfo(opt, option);
					if (option.choices) {
						opt.addChoices(...(option.choices as { name: string; value: number }[]));
					}
					if (option.minValue) opt.setMinValue(option.minValue);
					if (option.maxValue) opt.setMaxValue(option.maxValue);
					return opt;
				});
				break;
			case 'BOOLEAN':
				commandBuilder.addBooleanOption((opt) => setGenericOptionInfo(opt, option));
				break;
			case 'USER':
				commandBuilder.addUserOption((opt) => setGenericOptionInfo(opt, option));
				break;
			case 'CHANNEL':
				commandBuilder.addChannelOption((opt) => setGenericOptionInfo(opt, option));
				break;
			case 'ROLE':
				commandBuilder.addRoleOption((opt) => setGenericOptionInfo(opt, option));
				break;
			case 'MENTIONABLE':
				commandBuilder.addMentionableOption((opt) => setGenericOptionInfo(opt, option));
				break;
			case 'ATTACHMENT':
				commandBuilder.addAttachmentOption((opt) => setGenericOptionInfo(opt, option));
				break;
			default:
				console.error(`invalid option type: ${option.type}`);
		}
	});
}

function setGenericOptionInfo(optionBuilder: any, option: SlashCommandOptionConfig) {
	optionBuilder.setName(option.name);
	optionBuilder.setDescription(option.description);
	if (option.required) optionBuilder.setRequired(option.required);
	return optionBuilder;
}

async function listRemoteCommands(isGlobal: boolean): Promise<Command[] | null> {
	if (
		env === undefined ||
		env.DISCORD_APP_ID === undefined ||
		env.DISCORD_GUILD_ID === undefined ||
		env.DISCORD_TOKEN === undefined
	) {
		console.log('Failed');
		return null;
	}
	const rest = new REST({ version: '10' }).setToken(env.DISCORD_TOKEN);
	try {
		const commands = await rest.get(
			isGlobal
				? Routes.applicationCommands(env.DISCORD_APP_ID)
				: Routes.applicationGuildCommands(env.DISCORD_APP_ID, env.DISCORD_GUILD_ID),
		);
		return commands as Command[];
	} catch (error) {
		console.error('failed to list remote commands:', error);
		return null;
	}
}

async function verifyCommands(isGlobal: boolean): Promise<Choice[]> {
	const remoteCommands = await listRemoteCommands(isGlobal);
	const localCommands = await loadSlashCommands();
	const localCommandNames = Object.keys(localCommands);

	if (remoteCommands === null) {
		return localCommandNames.map((name) => ({
			title: `🆕 ${name}`,
			value: name,
		}));
	}

	const remoteCommandNames = remoteCommands.map((cmd) => cmd.name);
	const choices: Choice[] = localCommandNames.map((name) => ({
		title: remoteCommandNames.includes(name) ? `✅ ${name}` : `🆕 ${name}`,
		value: name,
	}));

	return choices;
}

async function deploySelectedCommands(selectedCommands: string[], isGlobal: boolean) {
	if (
		env === undefined ||
		env.DISCORD_APP_ID === undefined ||
		env.DISCORD_GUILD_ID === undefined ||
		env.DISCORD_TOKEN === undefined
	) {
		console.log('Failed');
		return;
	}
	const localCommands = await loadSlashCommands();
	const selectedBuilders = selectedCommands.map((name) => localCommands[name]).filter(Boolean);
	const existingCommands = await listRemoteCommands(isGlobal);

	if (existingCommands === null) {
		console.log('failed to get existing commands.');
		return;
	}

	const commandsToKeep = existingCommands.filter((cmd) => !selectedCommands.includes(cmd.name));
	const finalCommands = [...commandsToKeep, ...selectedBuilders.map((builder) => builder.toJSON())];

	const rest = new REST({ version: '10' }).setToken(env.DISCORD_TOKEN);
	try {
		await rest.put(
			isGlobal
				? Routes.applicationCommands(env.DISCORD_APP_ID)
				: Routes.applicationGuildCommands(env.DISCORD_APP_ID, env.DISCORD_GUILD_ID),
			{ body: finalCommands },
		);
		console.log(`${selectedCommands.length} deployed successfully.`);
	} catch (error) {
		console.error('failed to deploy selected commands:', error);
	}
}

async function deployAllCommands() {
	if (
		env === undefined ||
		env.DISCORD_APP_ID === undefined ||
		env.DISCORD_GUILD_ID === undefined ||
		env.DISCORD_TOKEN === undefined
	) {
		console.log('Failed');
		return;
	}
	const localCommands = await loadSlashCommands();
	const commandBuilders = Object.values(localCommands).map((builder) => builder.toJSON());

	const rest = new REST({ version: '10' }).setToken(env.DISCORD_TOKEN);
	try {
		await rest.put(Routes.applicationCommands(env.DISCORD_APP_ID), {
			body: commandBuilders,
		});
		console.log('all commands deployed successfully.');
	} catch (error) {
		console.error('failed to deploy all commands:', error);
	}
}

async function loadDeleteCommands(isGlobal: boolean): Promise<Choice[]> {
	const remoteCommands = await listRemoteCommands(isGlobal);
	if (!remoteCommands) return [];
	return remoteCommands.map((cmd) => ({ title: cmd.name, value: cmd.id }));
}

async function deleteCommands(selectedCommandIds: string[], isGlobal: boolean) {
	if (
		env === undefined ||
		env.DISCORD_APP_ID === undefined ||
		env.DISCORD_GUILD_ID === undefined ||
		env.DISCORD_TOKEN === undefined
	) {
		console.log('Failed');
		return;
	}
	const rest = new REST({ version: '10' }).setToken(env.DISCORD_TOKEN);
	for (const commandId of selectedCommandIds) {
		try {
			await rest.delete(
				isGlobal
					? Routes.applicationCommand(env.DISCORD_APP_ID, commandId)
					: Routes.applicationGuildCommand(env.DISCORD_APP_ID, env.DISCORD_GUILD_ID, commandId),
			);
			console.log(`deleted command with ID: ${commandId}`);
		} catch (error) {
			console.error(`failed to delete command with ID ${commandId}:`, error);
		}
	}
}

async function main() {
	if (
		env === undefined ||
		env.DISCORD_APP_ID === undefined ||
		env.DISCORD_GUILD_ID === undefined ||
		env.DISCORD_TOKEN === undefined
	) {
		console.log('Failed');
		return;
	}
	const actionResponse = await prompts({
		type: 'select',
		name: 'action',
		message: 'what do you want to do?',
		choices: [
			{
				title: 'register/update commands (global or guild)',
				value: 'regUpdate',
			},
			{ title: 'delete commands (global or guild)', value: 'delete' },
			{
				title: 'deploy all commands automatically (globally)',
				value: 'deployAll',
			},
			{ title: 'Salir', value: 'exit' },
		],
	});

	if (actionResponse.action === 'exit') {
		console.log('exiting...');
		return;
	}

	if (actionResponse.action === 'deployAll') {
		await deployAllCommands();
		return;
	}

	const siteResponse = await prompts({
		type: 'select',
		name: 'site',
		message: 'select site',
		choices: [
			{ title: '🌐 Global', value: 'global' },
			{ title: '🏠 Guild', value: 'guild' },
		],
	});

	const isGlobal = siteResponse.site === 'global';

	if (actionResponse.action === 'regUpdate') {
		const commandChoices = await verifyCommands(isGlobal);
		if (commandChoices.length === 0) {
			console.log('no commands available to deploy');
			return;
		}

		const commandResponse = await prompts({
			type: 'multiselect',
			name: 'commands',
			message: `select commands to deploy (${isGlobal ? 'Global' : 'Guild'}):`,
			choices: commandChoices,
			min: 1,
		});

		if (commandResponse.commands?.length > 0) {
			await deploySelectedCommands(commandResponse.commands, isGlobal);
		} else {
			console.log('no commands selected');
		}
	} else if (actionResponse.action === 'delete') {
		const commandChoices = await loadDeleteCommands(isGlobal);
		if (commandChoices.length === 0) {
			console.log('no commands available to delete');
			return;
		}

		const commandResponse = await prompts({
			type: 'multiselect',
			name: 'commands',
			message: `select commands to delete (${isGlobal ? 'Global' : 'Guild'}):`,
			choices: commandChoices,
			min: 1,
		});

		if (commandResponse.commands?.length > 0) {
			await deleteCommands(commandResponse.commands, isGlobal);
		} else {
			console.log('no commands selected');
		}
	}
}

main().catch(console.error);
