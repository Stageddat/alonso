// eslint.config.mjs
import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginPrettier from 'eslint-plugin-prettier';
import prettierConfig from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
	{
		files: ['**/*.{js,mjs,cjs,ts}'],
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
			ecmaVersion: 'latest',
			parser: tseslint.parser,
			parserOptions: {
				project: './tsconfig.json',
				tsconfigRootDir: import.meta.dirname,
				ecmaVersion: 'latest',
				sourceType: 'module',
			},
		},
		plugins: {
			prettier: eslintPluginPrettier,
			'@typescript-eslint': tseslint.plugin,
		},
		rules: {
			indent: 'off',
			'arrow-spacing': ['warn', { before: true, after: true }],
			'comma-dangle': 'off',
			'comma-spacing': 'off',
			'comma-style': 'off',
			curly: ['error', 'multi-line', 'consistent'],
			'dot-location': ['error', 'property'],
			'handle-callback-err': 'off',
			'keyword-spacing': 'off',
			'max-nested-callbacks': ['error', { max: 4 }],
			'max-statements-per-line': ['error', { max: 2 }],
			'no-console': 'off',
			'no-empty-function': 'error',
			'no-floating-decimal': 'error',
			'no-inline-comments': 'error',
			'no-lonely-if': 'error',
			'no-multi-spaces': 'off',
			'no-multiple-empty-lines': 'off',
			'no-shadow': ['error', { allow: ['err', 'resolve', 'reject'] }],
			'no-trailing-spaces': 'off',
			'no-var': 'error',
			'no-undef': 'off',
			'object-curly-spacing': 'off',
			'prefer-const': 'error',
			quotes: 'off',
			semi: 'off',
			'space-before-blocks': 'off',
			'space-before-function-paren': 'off',
			'space-in-parens': 'off',
			'space-infix-ops': 'off',
			'space-unary-ops': 'off',
			'spaced-comment': 'error',
			yoda: 'error',
			'@typescript-eslint/switch-exhaustiveness-check': 'error',
		},
	},
	{
		files: ['**/eslint.config.mjs'],
		languageOptions: {
			globals: globals.node,
		},
	},
	...tseslint.configs.recommendedTypeChecked,
	pluginJs.configs.recommended,
	prettierConfig,
];
