import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['./src/index.ts'],
	format: 'esm',
	clean: true,
	minify: true,
	outDir: 'dist',
	bundle: true,
	esbuildOptions(options) {
		options.alias = {
			'@': './src',
		};
	},
	dts: false,
	sourcemap: false,
});
