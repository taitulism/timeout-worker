import { WorkerRequest, WorkerResponse, RequestMessage, TimeoutMsg } from './types';

function workerOnMessage (ev: { data: RequestMessage; }) {
	const {data: requestMsg} = ev;

	if (requestMsg.action === WorkerRequest.SetTimeout) {
		const gotMsg = Date.now();
		const {id, ms, wasSetAt} = requestMsg;
		const delay = gotMsg - wasSetAt;

		const ref = setTimeout(() => {
			const now = Date.now();
			const msg: TimeoutMsg = {
				action: WorkerResponse.Timeout,
				id,
				workerTimestamp: now,
				gotMsg
			};

			postMessage(msg);
		}, ms - delay);

		postMessage({
			action: WorkerResponse.IsSet,
			id,
			ref,
		});
	}

	else if (requestMsg.action === WorkerRequest.ClearTimeout) {
		clearTimeout(requestMsg.ref);
	}
}

const workerCode = `
const WorkerRequest = JSON.parse('${JSON.stringify(WorkerRequest)}');
const WorkerResponse = JSON.parse('${JSON.stringify(WorkerResponse)}');

onmessage = ${workerOnMessage.toString()}
`;

export default workerCode;
