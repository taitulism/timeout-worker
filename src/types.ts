export type Ref = number;
export type Millisecond = number;
export type Timestamp = number;
export type ErrorHandler = (err: Error) => void;
export type TimeoutCallback = (...args: Array<any>) => void;

export interface SetTimeoutWorker {
	start: (workerClass?: Worker) => this;
	stop: () => this;
	onError: (callback: ErrorHandler) => void;
	setTimeout: (callback: TimeoutCallback, ms: number, ...args: Array<any>) => Ref;
	clearTimeout: (id: Ref) => void;
}

export enum WorkerRequest {
	SetTimeout,
	ClearTimeout,
}

export enum WorkerResponse {
	IsSet,
	Timeout,
	Cleared,
}

export type SetTimeoutMsg = {
	action: WorkerRequest.SetTimeout;
	id: number,
	ms: Millisecond,
	wasSetAt: Timestamp,
}

export type ClearTimeoutMsg = {
	action: WorkerRequest.ClearTimeout;
	ref: Ref,
	id: number,
}

export type TimeoutIsSetMsg = {
	action: WorkerResponse.IsSet;
	ref: Ref,
	id: number,
}

export type TimeoutMsg = {
	action: WorkerResponse.Timeout;
	id: number,
	workerTimestamp: Timestamp;
	gotMsg: Timestamp;
}

export enum Action {
	SetTimeout,
	ClearTimeout,
}

export type RequestMessage = SetTimeoutMsg | ClearTimeoutMsg;
export type ResponseMessage = TimeoutIsSetMsg | TimeoutMsg;

export type TimeoutObj = {
	ref: Ref | null;
	fn: TimeoutCallback;
	args: Array<any>;
}

export interface WorkerError extends Error {
	worker: string;
	line: number;
	col: number;
	timestamp: number;
}
