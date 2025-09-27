import { defineConfig } from 'tsup';
export default defineConfig({
	entry: ['./src/**/*.ts'],
	format: 'esm',
	clean: true,
	minify: true,
	outDir: 'dist',
	bundle: true,
	dts: false,
	sourcemap: false,
});
