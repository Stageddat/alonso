/* eslint-disable @typescript-eslint/no-explicit-any */
import { env } from './env.js';
import pc from 'picocolors';

export class Logger {
	private static _getTimeStamp() {
		return `[${new Date().toISOString()}]`;
	}

	private static _formatMessage(message: any): string {
		if (message === null) return 'null';
		if (message === undefined) return 'undefined';
		if (typeof message === 'object') {
			try {
				return JSON.stringify(message, null, 2);
			} catch {
				return String(message);
			}
		}
		return String(message);
	}

	private static _formatMessages(messages: any[]): string {
		return messages.map((msg) => Logger._formatMessage(msg)).join(' ');
	}

	public static log(...messages: any[]) {
		console.log(`${pc.green('[LOG]')} ${this._getTimeStamp()} ${this._formatMessages(messages)}`);
	}
	public static info(...messages: any[]) {
		console.log(`${pc.blue('[INFO]')} ${this._getTimeStamp()} ${this._formatMessages(messages)}`);
	}
	public static error(...messages: any[]) {
		console.error(`${pc.red('[ERROR]')} ${this._getTimeStamp()} ${this._formatMessages(messages)}`);
	}
	public static warn(...messages: any[]) {
		console.warn(
			`${pc.yellow('[WARN]')} ${this._getTimeStamp()} ${this._formatMessages(messages)}`,
		);
	}
	public static debug(...messages: any[]) {
		if (env.DEBUG === false) return;
		console.debug(
			`${pc.magenta('[DEBUG]')} ${this._getTimeStamp()} ${this._formatMessages(messages)}`,
		);
	}
}
