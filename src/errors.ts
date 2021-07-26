import { WorkerError } from './types';

export const ON_ERROR_ARG_TYPE_ERROR = '.onError is expecting a function';
export const WORKER_NOT_INITIALIZED_ERROR = 'timeoutWorker is not initialized. Call `.start()`.';

export function getErrFromEvent (errEv: ErrorEvent): WorkerError {
	const errMsg = getWorkerErrMsg(errEv);
	const err = new Error(errMsg) as WorkerError;

	err.worker = errEv.filename;
	err.line = errEv.lineno;
	err.col = errEv.colno;
	err.timestamp = errEv.timeStamp;

	return err;
}

function getWorkerErrMsg (errEv: ErrorEvent): string {
	return `\
TimeoutWorker
${errEv.message}
	Worker: ${errEv.filename}
	Line: ${errEv.lineno}
	Col: ${errEv.colno}
	Timestamp: ${errEv.timeStamp}`;
}
