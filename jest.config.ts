import nextJest from 'next/jest';

const createJestConfig = nextJest({
	dir: './' // Path to your Next.js app
});

// fix for nextjs issue with transformIgnorePatterns
async function jestConfig() {
	const nextJestConfig = await createJestConfig(customJestConfig)();
	// /node_modules/ is the first pattern

	if (nextJestConfig.transformIgnorePatterns === undefined) {
		nextJestConfig.transformIgnorePatterns = [];
	} else {
		nextJestConfig.transformIgnorePatterns[0] =
			'/node_modules/(?!lucide-react)/';
	}

	return nextJestConfig;
}

const customJestConfig = {
	testEnvironment: 'jsdom',
	moduleNameMapper: {
		'^@/(.*)$': '<rootDir>/$1', // Support for @/* imports
		'\\.(css|less|scss|sass)$': 'identity-obj-proxy', // Handle CSS imports
		'\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.ts' // Handle static files
	},
	setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'] // Optional, for @testing-library/jest-dom
};

export default jestConfig;
