export default {
	preset: 'ts-jest/presets/default-esm',
  	testEnvironment: 'node',
	extensionsToTreatAsEsm: ['.ts'],
	moduleNameMapper: {
		'^@shared/(.*)\\.js$': '<rootDir>/shared/$1',
		'^@shared/(.*)$': '<rootDir>/shared/$1',
		'^@/(.*)\\.js$': '<rootDir>/src/$1',
		'^@/(.*)$': '<rootDir>/src/$1',
		'^(\\.{1,2}/.*)\\.js$': '$1',
	},
	transform: {
		'^.+\\.tsx?$': ['ts-jest', { useESM: true, config: 'tsconfig.json' }],
	},
	testPathIgnorePatterns: ['<rootDir>/jen-client/', '/node_modules/'],
};