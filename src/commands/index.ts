import pingCommand from './utils/ping.js';
import helpCommand from './support/ayuda.js';
import statusCommand from './utils/status.js';

export const commands = {
	ping: pingCommand,
	ayuda: helpCommand,
	status: statusCommand,
};
