/* eslint-disable max-params, function-paren-newline */
import {RequestMessage, TimesUpMsg, WorkerRequest, WorkerResponse } from './types';

export const workerCode = `
	onmessage = (${createWorkerMsgHandler})(
		self.postMessage,
		${JSON.stringify(WorkerRequest)},
		${JSON.stringify(WorkerResponse)},
	);
`;

export function createWorkerMsgHandler (
	_postMessage: typeof postMessage,
	_WorkerRequest: typeof WorkerRequest,
	_WorkerResponse: typeof WorkerResponse,
): (ev: { data: RequestMessage }) => void {
	return function workerOnMessage (ev: { data: RequestMessage }): void {
		const {data: requestMsg} = ev;

		if (requestMsg.action === _WorkerRequest.SetTimeout) {
			const gotMsg = Date.now();
			const {id, ms, wasSetAt} = requestMsg;
			const delay = gotMsg - wasSetAt;

			const ref = setTimeout(() => {
				const now = Date.now();
				const msg: TimesUpMsg = {
					action: _WorkerResponse.TimesUp,
					id,
					workerTimestamp: now,
					gotMsg
				};

				_postMessage(msg);
			}, ms - delay);

			_postMessage({
				action: _WorkerResponse.TimeoutIsSet,
				id,
				ref,
			});
		}
		else if (requestMsg.action === _WorkerRequest.ClearTimeout) {
			clearTimeout(requestMsg.ref as number);
		}
	};
}

