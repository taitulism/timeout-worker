/* eslint-disable no-magic-numbers */

export type TimeoutRef = number;
export type Milliseconds = number;
export type Timestamp = number;
export type ErrorHandler = (err: Error) => void;
export type TimeoutCallback = (...args: Array<unknown>) => void;

export interface TimeoutWorker {
	start: (workerClass?: Worker) => this;
	stop: () => this;
	onError: (callback: ErrorHandler) => void;
	setTimeout: (callback: TimeoutCallback, ms: number, ...args: Array<unknown>) => TimeoutRef;
	clearTimeout: (id: TimeoutRef) => void;
}

export const WorkerRequest = {
	SetTimeout: 0,
	ClearTimeout: 1,
} as const;

export const WorkerResponse = {
	TimeoutIsSet: 2,
	TimesUp: 3,
} as const;

export type SetTimeoutMsg = {
	action: typeof WorkerRequest.SetTimeout;
	id: number,
	ms: Milliseconds,
	wasSetAt: Timestamp,
}

export type ClearTimeoutMsg = {
	action: typeof WorkerRequest.ClearTimeout;
	ref: TimeoutRef,
	id: number,
}

export type TimeoutIsSetMsg = {
	action: typeof WorkerResponse.TimeoutIsSet;
	ref: TimeoutRef,
	id: number,
}

export type TimesUpMsg = {
	action: typeof WorkerResponse.TimesUp;
	id: number,
	workerTimestamp: Timestamp;
	gotMsg: Timestamp;
}

export type RequestMessage = SetTimeoutMsg | ClearTimeoutMsg;
export type ResponseMessage = TimeoutIsSetMsg | TimesUpMsg;

export type TimeoutObj = {
	ref: TimeoutRef | null;
	fn: TimeoutCallback;
	args: Array<unknown>;
}

export interface WorkerError extends Error {
	worker: string;
	line: number;
	col: number;
	timestamp: number;
}
