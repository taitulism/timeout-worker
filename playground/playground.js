/* eslint-disable */

// module is in scope (loaded by ./playground.html)
const {timeoutWorker} = stow;

(async () => {
	try {
		timeoutWorker.start().onError((err) => {
			console.error(err);
		})

		const ref = timeoutWorker.setTimeout(() => {
			console.log('whatever');
		}, 1000);

		// timeoutWorker.clearTimeout(ref);

		// let i = 5_000_000;
		// while (i >= 0) {
		// 	i--;
		// }

		// timeoutWorker.setTimeout(() => {
		// 	console.log('whatever 2');
		// }, 1500);

		// let j = 5_000_000;
		// while (j >= 0) {
		// 	j--;
		// }

		// const start = Date.now()
		// timeoutWorker.setTimeout(() => {
		// 	const end = Date.now();
		// 	console.log('*************');
		// 	console.log('started', start);
		// 	console.log('end', end);
		// 	console.log('Total', end - start);
		// }, 3000)
	}
	catch (err) {
		console.error('ARRRR');
		console.error(err);
	}
})();
