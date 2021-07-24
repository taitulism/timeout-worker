import sinon from 'sinon';

import chai from 'chai';
import {setTimeoutWorker} from '../src/index';
import { MockWorker } from './mock-worker';

const {expect} = chai;

const sleep = (ms: number): Promise<void> => (
	new Promise(resolve => setTimeout(resolve, ms))
);

const createMockWorker = (): Worker => new MockWorker('url');

describe('setTimeoutWorker', () => {
	afterEach(() => {
		setTimeoutWorker.stop();
	});

	describe('worker', () => {
		describe('methods', () => {
			it('.start()', () => {
				expect(setTimeoutWorker.start).to.be.a('function');
			});

			it('.stop()', () => {
				expect(setTimeoutWorker.stop).to.be.a('function');
			});

			it('.setTimeout()', () => {
				expect(setTimeoutWorker.setTimeout).to.be.a('function');
			});

			it('.clearTimeout()', () => {
				expect(setTimeoutWorker.clearTimeout).to.be.a('function');
			});
		});

		describe('start', () => {
			it('initializes the worker successfully', () => (
				expect(() => setTimeoutWorker.start()).not.to.throw()
			));

			it('doesn\'t fail when called multiple times', () => {
				expect(setTimeoutWorker.start().start().start()).to.deep.equal(setTimeoutWorker);
			});

			it('accepts a Worker-like instance', () => {
				const spy = sinon.spy();
				const clock = sinon.useFakeTimers();
				const mockWorker = createMockWorker();

				setTimeoutWorker.start(mockWorker);
				setTimeoutWorker.setTimeout(spy, 500);

				clock.tick(400);
				expect(spy.callCount).to.equal(0);

				clock.tick(101);
				expect(spy.callCount).to.equal(1);

				clock.restore();
			});
		});

		describe('setTimeout', () => {
			it('sets a timeout via a web-worker (not `window.setTimeout`)', async () => {
				const spy = sinon.spy();
				const windowSetTimeout = sinon.spy(window, 'setTimeout');

				setTimeoutWorker.start();
				setTimeoutWorker.setTimeout(spy, 600);

				expect(spy.callCount).to.equal(0);
				expect(windowSetTimeout.callCount).to.equal(0);

				// `sleep` uses the window.setTimeout

				await sleep(500);
				expect(spy.callCount).to.equal(0);
				expect(windowSetTimeout.callCount).to.equal(1);

				await sleep(110);
				expect(spy.callCount).to.equal(1);
				expect(windowSetTimeout.callCount).to.equal(2);

				windowSetTimeout.restore();
			});

			it('calls the callback on timeout', () => {
				const spy = sinon.spy();
				const clock = sinon.useFakeTimers();
				const mockWorker = createMockWorker();

				setTimeoutWorker.start(mockWorker);
				setTimeoutWorker.setTimeout(spy, 1000);

				clock.tick(900);
				expect(spy.callCount).to.equal(0);

				clock.tick(101);
				expect(spy.callCount).to.equal(1);

				clock.restore();
			});

			it('throws when called without initializing a worker first', () => {
				const spy = sinon.spy();
				// no .start()
				const throwingFn = () => setTimeoutWorker.setTimeout(spy, 1000);

				return expect(throwingFn).to.throw('SetTimeoutWorker is not initialized.');
			});

			it('can be called multiple times', () => {
				const mockWorker = createMockWorker();

				setTimeoutWorker.start(mockWorker);

				const clock = sinon.useFakeTimers();
				const spy1 = sinon.spy();
				const spy2 = sinon.spy();
				const spy3 = sinon.spy();
				const spy4 = sinon.spy();

				setTimeoutWorker.setTimeout(spy1, 1000);
				setTimeoutWorker.setTimeout(spy2, 1100);
				setTimeoutWorker.setTimeout(spy3, 1100);
				setTimeoutWorker.setTimeout(spy4, 1200);

				clock.tick(1001);
				expect(spy1.callCount).to.equal(1);
				expect(spy2.callCount).to.equal(0);
				expect(spy3.callCount).to.equal(0);
				expect(spy4.callCount).to.equal(0);

				clock.tick(100);
				expect(spy1.callCount).to.equal(1);
				expect(spy2.callCount).to.equal(1);
				expect(spy3.callCount).to.equal(1);
				expect(spy4.callCount).to.equal(0);

				clock.tick(100);
				expect(spy1.callCount).to.equal(1);
				expect(spy2.callCount).to.equal(1);
				expect(spy3.callCount).to.equal(1);
				expect(spy4.callCount).to.equal(1);

				clock.restore();
			});

			it('calls the callback with additional arguments', () => {
				const clock = sinon.useFakeTimers();
				const mockWorker = createMockWorker();

				setTimeoutWorker.start(mockWorker);

				const spy = sinon.spy();
				const arg1 = 1;
				const arg2 = {a:1, b:2};
				const arg3 = ['a', 'b', 'c'];

				setTimeoutWorker.setTimeout(spy, 1000, arg1, arg2, arg3);

				clock.tick(900);
				expect(spy.calledOnce).to.be.false;

				clock.tick(101);
				expect(spy.calledOnce).to.be.true;
				expect(spy.calledOnceWithExactly(arg1, arg2, arg3)).to.be.true;

				clock.restore();
			});
		});

		describe('clearTimeout', () => {
			it('clears an active timeout', () => {
				const clock = sinon.useFakeTimers();
				const spy1 = sinon.spy();
				const spy2 = sinon.spy();
				const mockWorker = createMockWorker();

				setTimeoutWorker.start(mockWorker);
				const ref1 = setTimeoutWorker.setTimeout(spy1, 1000);
				const ref2 = setTimeoutWorker.setTimeout(spy2, 1000); // eslint-disable-line

				clock.tick(900);
				expect(spy1.callCount).to.equal(0);
				expect(spy2.callCount).to.equal(0);
				setTimeoutWorker.clearTimeout(ref1);

				clock.tick(101);
				expect(spy1.callCount).to.equal(0);
				expect(spy2.callCount).to.equal(1);

				clock.restore();
			});
		});

		describe('stop', () => {
			it('kills the worker and all of its timeouts', () => {
				const clock = sinon.useFakeTimers();
				const mockWorker = createMockWorker();

				setTimeoutWorker.start(mockWorker);

				const spy1 = sinon.spy();
				const spy2 = sinon.spy();
				const spy3 = sinon.spy();

				setTimeoutWorker.setTimeout(spy1, 1000);
				setTimeoutWorker.setTimeout(spy2, 1000);
				setTimeoutWorker.setTimeout(spy3, 1000);

				clock.tick(900);
				expect(spy1.callCount).to.equal(0);
				expect(spy2.callCount).to.equal(0);
				expect(spy3.callCount).to.equal(0);

				setTimeoutWorker.stop();

				clock.tick(110);
				expect(spy1.callCount).to.equal(0);
				expect(spy2.callCount).to.equal(0);
				expect(spy3.callCount).to.equal(0);

				clock.restore();
			});

			it('doesn\'t fail when called first', () => {
				expect(() => setTimeoutWorker.stop()).not.to.throw();
			});

			it('doesn\'t fail when called multiple times', () => {
				expect(() => setTimeoutWorker.stop().stop().stop()).not.to.throw();
			});
		});
	});
});
