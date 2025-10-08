import { env } from './env';
import Agenda from 'agenda';

const mongoConnectionString = env.MONGO_CONNECTION_STRING;
export const agenda = new Agenda({ db: { address: mongoConnectionString } });
