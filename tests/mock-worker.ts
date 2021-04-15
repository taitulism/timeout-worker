/* eslint-disable */

import { RequestMessage, ResponseMessage, TimeoutMsg, WorkerRequest, WorkerResponse } from '../src/types';
import { getWorkerOnMsgHandler } from '../src/worker-code';

export class MockWorker implements Worker {
	msgQueue: Array<any> = [];
	errQueue: Array<any> = [];
	url: string | URL;
	workerOnMessage: any;

	constructor (
		url: string | URL,
		options?: WorkerOptions | undefined
	) {
		this.url = url;
		this.workerOnMessage = getWorkerOnMsgHandler(this.workerPostMessage);
	}

	workerPostMessage = (msg: any) => {
		setTimeout(() => {
			const event = {data: msg};
			this.msgQueue.forEach((callback) => {
				callback(event);
			});
		}, 1);
	}

	addEventListener (eventName: string, callback: any) {
		if (eventName === 'message') {
			this.msgQueue.push(callback);
		}
		else if (eventName === 'error') {
			this.errQueue.push(callback);
		}
	}

	dispatchEvent (ev: Event) { return true; }
	onerror (ev: Event) { }
	onmessageerror () { }
	onmessage (ev: {data: ResponseMessage}) {}

	postMessage (reqMsg: RequestMessage) {
		setTimeout(() => {
			this.workerOnMessage({data: reqMsg});
		}, 0);
	}

	removeEventListener () {
		console.log('removeEventListener');
	}

	terminate () {
		this.msgQueue = [];
		this.errQueue = [];
		this.url = '';
	}
}
