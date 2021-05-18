/* eslint-disable */
const typescript = require('@rollup/plugin-typescript');
const commonjs = require('@rollup/plugin-commonjs');
const nodeResolve = require('@rollup/plugin-node-resolve').nodeResolve;

/* possible `logLevel` values:
 	* config.LOG_DISABLE
 	* config.LOG_ERROR
 	* config.LOG_WARN
 	* config.LOG_INFO
 	* config.LOG_DEBUG
*/
module.exports = function karma (config) {
	config.set({
		logLevel: config.LOG_INFO,
		basePath: '',
		port: 9876,
		concurrency: Infinity,
		colors: true,
		singleRun: true,
		autoWatch: false,
		browserNoActivityTimeout: 480000,
		frameworks: ['mocha', 'chai', 'sinon'],
		reporters: ['mocha'],
		files: [
			{ pattern: 'tests/index.spec.ts', watched: false },
		],
		preprocessors: {
			'tests/index.spec.ts': ['rollup'],
		},
		rollupPreprocessor: {
			plugins: [
				nodeResolve(),
				commonjs(),
				typescript({
					declaration: false,
					declarationMap: false,
					outDir: undefined,
				})
			],
			onwarn (warning, rollupWarn) {
				if (warning.code !== 'CIRCULAR_DEPENDENCY' && warning.code !== 'EVAL') {
					rollupWarn(warning);
				}
			},
			output: {
				format: 'iife',
				name: 'setTimeoutWorker',
			},
		},
		client: {
			clearContext: false,
			mocha: {
				reporter: 'html',
				timeout: 5000,
				slow: 1000,
			},
		},
		browsers: [
			'HeadlessChrome',
			// 'ChromeWithGUI',
		],
		customLaunchers: {
			HeadlessChrome: {
				base: 'ChromeHeadless',
				flags: ['--no-sandbox']
			},
			ChromeWithGUI: {
				base: 'Chrome',
				flags: [
					'--no-sandbox',
					'--disable-gpu',
					'--remote-debugging-port-9222'
				]
			},
		},
	});
};
