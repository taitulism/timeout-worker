/* eslint-disable */

import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default [{
	input: 'src/index.ts',
	plugins: [typescript()],
	output: {
		file: 'dev-bundles/set-timeout-worker.js',
		format: 'iife',
		sourcemap: true,
		name: 'stow',
	},
}, {
	input: 'tests/index.spec.ts',
	plugins: [nodeResolve(), commonjs(), typescript()],
	output: {
		file: 'dev-bundles/set-timeout-worker-spec.js',
		sourcemap: true,
		format: 'iife',
	},
	onwarn (warning, rollupWarn) {
		if (warning.code !== 'CIRCULAR_DEPENDENCY' && warning.code !== 'EVAL') {
			rollupWarn(warning);
		}
	},
}];
