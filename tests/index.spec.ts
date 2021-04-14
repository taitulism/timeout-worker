import sinon from 'sinon';
import chai from 'chai';
import stoWrk from '../src/index';

const {expect} = chai;

const sleep = (ms: number): Promise<void> => (
	new Promise((resolve) => {
		setTimeout(() => {
			resolve();
		}, ms);
	})
);

describe('setTimeoutWorker', () => {
	describe('worker', () => {
		describe('methods', () => {
			it('.start()', () => {
				expect(stoWrk.start).to.be.a('function');
			});

			it('.stop()', () => {
				expect(stoWrk.stop).to.be.a('function');
			});

			it('.setTimeout()', () => {
				expect(stoWrk.setTimeout).to.be.a('function');
			});

			it('.clearTimeout()', () => {
				expect(stoWrk.clearTimeout).to.be.a('function');
			});
		});

		describe('start', () => {
			it('initializes the worker', async () => {
				const spy = sinon.spy();

				stoWrk.start();
				stoWrk.setTimeout(spy, 500);

				await sleep(1000);
				stoWrk.stop();

				expect(spy.callCount).to.equal(1);
			});

			it('doesn\'t fail when called multiple times', () => {
				expect(stoWrk.start().start().start()).to.deep.equal(stoWrk);
				stoWrk.stop();
			});
		});

		describe('setTimeout', () => {
			it('sets a timeout via a web-worker', () => {
				const spy = sinon.spy();
				const origSetTimeout = sinon.spy(window, 'setTimeout');

				stoWrk.start();
				stoWrk.setTimeout(spy, 1000);

				expect(origSetTimeout.callCount).to.equal(0);

				const p = sleep(2000).then(() => {
					expect(origSetTimeout.callCount).to.equal(1);
					origSetTimeout.restore();
					stoWrk.stop();
				});

				expect(origSetTimeout.callCount).to.equal(1);

				return p;
			});

			it('calls the callback on timeout', async () => {
				const spy = sinon.spy();

				stoWrk.start();
				stoWrk.setTimeout(spy, 2000);

				await sleep(2100);
				stoWrk.stop();

				expect(spy.callCount).to.equal(1);
			});

			it('throws when called without initializing a worker first', () => {
				const spy = sinon.spy();
				// no .start()
				const throwingFn = () => stoWrk.setTimeout(spy, 1000);

				return expect(throwingFn).to.throw('SetTimeoutWorker is not initialized.');
			});

			it('can be called multiple times', async () => {
				stoWrk.start();
				const spy1 = sinon.spy();
				const spy2 = sinon.spy();
				const spy3 = sinon.spy();
				const spy4 = sinon.spy();

				stoWrk.setTimeout(spy1, 1000);
				stoWrk.setTimeout(spy2, 1000);
				const cancelRef = stoWrk.setTimeout(spy3, 1000);
				stoWrk.setTimeout(spy4, 1000);

				sleep(100).then(() => {
					stoWrk.clearTimeout(cancelRef);
				});

				await sleep(1100);
				stoWrk.stop();

				expect(spy1.callCount).to.equal(1);
				expect(spy2.callCount).to.equal(1);
				expect(spy3.callCount).to.equal(0);
				expect(spy4.callCount).to.equal(1);
			});

			it('calls the callback with additional arguments', async () => {
				stoWrk.start();

				const spy = sinon.spy();
				const arg1 = 1;
				const arg2 = {a:1, b:2};
				const arg3 = ['a', 'b', 'c'];

				stoWrk.setTimeout(spy, 1000, arg1, arg2, arg3);

				await sleep(1100);
				stoWrk.stop();

				expect(spy.calledOnceWithExactly(arg1, arg2, arg3)).to.be.true;
			});
		});

		describe('clearTimeout', () => {
			it('clears an active timeout', async () => {
				const spy = sinon.spy();

				stoWrk.start();
				const ref = stoWrk.setTimeout(spy, 500);

				stoWrk.clearTimeout(ref);

				await sleep(1000);
				expect(spy.callCount).to.equal(0);

				stoWrk.stop();
			});
		});

		describe('stop', () => {
			it('kills the worker and all of its timeouts', async () => {
				stoWrk.start();

				const spy1 = sinon.spy();
				const spy2 = sinon.spy();
				const spy3 = sinon.spy();

				stoWrk.setTimeout(spy1, 1000);
				stoWrk.setTimeout(spy2, 1000);
				stoWrk.setTimeout(spy3, 1000);

				sleep(500).then(() => {
					stoWrk.stop();
				});

				await sleep(2100);
				expect(spy1.callCount).to.equal(0);
				expect(spy2.callCount).to.equal(0);
				expect(spy3.callCount).to.equal(0);
			});

			it('doesn\'t fail when called first', () => {
				expect(stoWrk.stop()).to.not.throw;
			});

			it('doesn\'t fail when called multiple times', () => {
				expect(stoWrk.stop().stop().stop()).to.not.throw;
			});
		});
	});
});
