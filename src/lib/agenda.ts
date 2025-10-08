import { env } from './env';
import Agenda from 'agenda';
import { Logger } from './logger';

const mongoConnectionString = env.MONGO_CONNECTION_STRING;
export const agenda = new Agenda({ db: { address: mongoConnectionString } });

agenda.define('test', async (job: any) => {
	Logger.debug('Running test job...');
	Logger.debug(job.attrs.data);
});
