/* eslint-disable
	lines-between-class-members,
	class-methods-use-this,
	no-console,
*/

import { RequestMessage, ResponseMessage, WorkerError, WorkerRequest, WorkerResponse } from '../src/types';
import { createWorkerMsgHandler } from '../src/worker-code';

interface MsgEvent extends Event {data: ResponseMessage}
interface ErrEvent extends Event {data: WorkerError}

type MsgEventHandler = (event: MsgEvent) => void
type ErrEventHandler = (event: ErrEvent) => void

export class MockWorker implements Worker {
	private msgQueue: Array<MsgEventHandler> = [];
	private errQueue: Array<ErrEventHandler> = [];
	private workerOnMessage: ReturnType<typeof createWorkerMsgHandler>;

	url: string | URL;

	constructor (url: string | URL) {
		this.url = url;
		this.workerOnMessage = createWorkerMsgHandler(
			this.workerPostMessage,
			WorkerRequest,
			WorkerResponse,
		);
	}

	workerPostMessage = (msg: ResponseMessage): void => {
		setTimeout(() => {
			const event = new Event('msg-from-worker');
			const ev = Object.create(event);
			ev.data = msg;

			this.msgQueue.forEach(callback => callback(ev));
		}, 0);
	}

	addEventListener (eventName: string, callback: EventListener): void {
		if (eventName === 'message') {
			this.msgQueue.push(callback as MsgEventHandler);
		}
		else if (eventName === 'error') {
			this.errQueue.push(callback as ErrEventHandler);
		}
	}

	dispatchEvent (ev: Event): boolean { console.log('dispatchEvent', ev); return true; }
	onerror (ev: Event): void { console.log('onerror', ev); }
	onmessageerror (): void { console.log('onmessageerror'); }
	onmessage (ev: {data: ResponseMessage}): void { console.log(ev); }

	postMessage (reqMsg: RequestMessage): void {
		setTimeout(() => {
			const event = new Event('worker-got-msg');
			const ev = Object.create(event);
			ev.data = reqMsg;

			this.workerOnMessage(ev);
		}, 0);
	}

	removeEventListener (): void {
		console.log('removeEventListener');
	}

	terminate (): void {
		this.msgQueue = [];
		this.errQueue = [];
		this.url = '';
	}
}
