import type { StorybookConfig } from '@storybook/nextjs-vite';

import path from 'path';

const getAbsolutePath = (packageName: string): any =>
	path
		.dirname(require.resolve(path.join(packageName, 'package.json')))
		.replace(/^file:\/\//, '');

const config: StorybookConfig = {
	stories: [
		'../stories/**/*.mdx',
		'../stories/**/*.stories.@(js|jsx|mjs|ts|tsx)'
	],
	addons: [
		getAbsolutePath('@chromatic-com/storybook'),
		getAbsolutePath('@storybook/addon-docs'),
		getAbsolutePath('@storybook/addon-a11y'),
		getAbsolutePath('@storybook/addon-vitest')
	],

	framework: {
		name: getAbsolutePath('@storybook/nextjs-vite'),
		options: {}
	},
	staticDirs: ['..\\public']
};
export default config;
