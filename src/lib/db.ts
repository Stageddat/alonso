import PocketBase from 'pocketbase';
import { env } from './env';

export const pb = new PocketBase('https://rokipb.stageddat.dev/');
pb.authStore.save(env.DB_TOKEN, null);
