import { defineConfig } from 'tsup';

export default defineConfig({
	entry: ['./src/index.ts'],
	format: 'cjs',
	clean: true,
	minify: true,
	keepNames: true,
	treeshake: true,
	outDir: 'dist',
	bundle: true,
	platform: 'node',
	target: 'node16',
	esbuildOptions(options) {
		options.alias = {
			'@': './src',
		};
	},
	dts: false,
	sourcemap: false,
	noExternal: [/(.*)/],
	splitting: false,
});
