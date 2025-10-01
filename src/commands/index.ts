import pingCommand from './utils/ping.js';
import helpCommand from './support/ayuda.js';
import statusCommand from './utils/status.js';
import testCommand from './utils/test.js';
import updateCommand from './utils/update.js';

export const commands = {
	ping: pingCommand,
	ayuda: helpCommand,
	status: statusCommand,
	test: testCommand,
	update: updateCommand,
};
