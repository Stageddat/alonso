import { EmbedBuilder } from 'discord.js';

export const testEmbed = new EmbedBuilder()
	.setColor(0xffbc00)
	.setTitle('testing response')
	.setDescription('you shouldnt see this...');

export const errorEmbed = new EmbedBuilder()
	.setColor(0xff0000)
	.setTitle('¿Dónde está el 33?')
	.setDescription(
		'Parece que algo salió mal :c... ¡no es tu culpa!\nPor favor, inténtalo de nuevo más tarde.',
	);

export const notAllowedEmbed = new EmbedBuilder()
	.setColor(0xff0000)
	.setTitle('¡Tu nivel de sigma es muy bajo!🗿')
	.setDescription('No eres lo suficientemente sigma para esto.');
