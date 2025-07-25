import { describe, expect, test } from '@jest/globals';
import { calculateWaterIntake } from '../lib/utils';

describe('sum module', () => {
	test('adds 1 + 2 to equal 3', () => {
		expect(1 + 2).toBe(3);
	});
});

describe('utils module', () => {
	test('calculate water intake by weight', () => {
		const weightInPounds = 155;

		expect(calculateWaterIntake(weightInPounds).glasses).toBe(6.5);
	});
});
