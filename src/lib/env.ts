import dotenv from 'dotenv';
import { z } from 'zod';
import { Logger } from './logger.js';

dotenv.config();

const envSchema = z.object({
	DISCORD_TOKEN: z.string().min(1, 'DISCORD_TOKEN is required'),
	DISCORD_APP_ID: z.string().min(1, 'DISCORD_APP_ID is required'),
	DISCORD_GUILD_ID: z.string().min(1, 'DISCORD_GUILD_ID is required'),
	DEBUG: z.string().transform((val) => {
		const lower = val.toLowerCase();
		return lower === 'true' || lower === '1';
	}),
	NODE_ENV: z.enum(['development', 'production', 'test'], {
		errorMap: () => ({
			message: "NODE_ENV must be either 'development', 'production' o 'test'",
		}),
	}),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
	try {
		return envSchema.parse(process.env);
	} catch (err) {
		if (err instanceof z.ZodError) {
			console.error('Failed to validate environment variables:');

			for (const issue of err.issues) {
				console.error(`- ${issue.path.join('.')}: ${issue.message}`);
			}
		} else {
			Logger.error('Error validating environment variables:', err);
		}

		process.exit(1);
	}
}

export const env = validateEnv();
