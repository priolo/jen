export default {
	preset: 'ts-jest/presets/default-esm',
  	testEnvironment: 'node',
	extensionsToTreatAsEsm: ['.ts'],
	moduleNameMapper: {
		'^@/(.*)\.js$': '<rootDir>/src/$1',
		'^@/(.*)$': '<rootDir>/src/$1',
		'^(\\.{1,2}/.*)\\.js$': '$1',
	},
	transform: {
		'^.+\\.tsx?$': ['ts-jest', { useESM: true, config: 'tsconfig.json' }],
	},
};