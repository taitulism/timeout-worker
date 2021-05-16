/* eslint-disable function-paren-newline */
import { WorkerRequest, WorkerResponse, RequestMessage, TimeoutMsg, ResponseMessage } from './types';

export function getWorkerOnMsgHandler (
	postMessage?: (msg: ResponseMessage) => void
): (ev: { data: RequestMessage }) => void {
	return function workerOnMessageForMock (ev: { data: RequestMessage }): void {
		const {data: requestMsg} = ev;

		if (requestMsg.action === WorkerRequest.SetTimeout) {
			const gotMsg = Date.now();
			const {id, ms, wasSetAt} = requestMsg;
			const delay = gotMsg - wasSetAt;

			const ref = self.setTimeout(() => {
				const now = Date.now();
				const msg: TimeoutMsg = {
					action: WorkerResponse.Timeout,
					id,
					workerTimestamp: now,
					gotMsg
				};

				postMessage!(msg);
			}, ms - delay);

			postMessage!({
				action: WorkerResponse.IsSet,
				id,
				ref,
			});
		}
		else if (requestMsg.action === WorkerRequest.ClearTimeout) {
			clearTimeout(requestMsg.ref);
		}
	};
}

export const workerCode = `
	const WorkerRequest = JSON.parse('${JSON.stringify(WorkerRequest)}');
	const WorkerResponse = JSON.parse('${JSON.stringify(WorkerResponse)}');

	onmessage = ${getWorkerOnMsgHandler().toString()}
`;
