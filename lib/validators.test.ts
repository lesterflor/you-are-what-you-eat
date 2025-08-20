import { describe, expect, test } from '@jest/globals';
import { getLogSchema } from './validators';

describe('getLogSchema', () => {
	test('validates a correct log object', () => {
		const now = new Date();
		const valid = {
			id: 'log1',
			createdAt: now,
			updatedAt: now,
			userId: 'user1',
			foodItems: [
				{
					id: 'food1',
					name: 'Apple',
					category: 'Fruit',
					description: 'Fresh apple',
					numServings: 1,
					image: 'apple.png',
					carbGrams: 10,
					proteinGrams: 1,
					fatGrams: 0,
					calories: 40,
					eatenAt: now
				}
			],
			knownCaloriesBurned: [
				{
					id: 'burn1',
					createdAt: now,
					updatedAt: now,
					userId: 'user1',
					logId: 'log1',
					calories: 100
				}
			],
			logRemainder: [],
			comparisons: null,
			user: {
				BaseMetabolicRate: [
					{
						id: 'bmr1',
						createdAt: now,
						updatedAt: now,
						userId: 'user1',
						weight: 70,
						weightUnit: 'kg',
						height: 175,
						heightUnit: 'cm',
						age: 30,
						sex: 'male',
						bmr: 1700
					}
				]
			},
			totalCalories: 40,
			remainingCalories: 1660
		};
		expect(() => getLogSchema.parse(valid)).not.toThrow();
	});

	test('fails if required fields are missing', () => {
		const now = new Date();
		const invalid = {
			// id missing
			createdAt: now,
			updatedAt: now,
			userId: 'user1',
			foodItems: [],
			knownCaloriesBurned: [],
			user: { BaseMetabolicRate: [] },
			totalCalories: 0,
			remainingCalories: 0
		};
		expect(() => getLogSchema.parse(invalid)).toThrow();
	});

	test('fails if foodItems is not an array', () => {
		const now = new Date();
		const invalid = {
			id: 'log1',
			createdAt: now,
			updatedAt: now,
			userId: 'user1',
			foodItems: 'not-an-array',
			knownCaloriesBurned: [],
			user: { BaseMetabolicRate: [] },
			totalCalories: 0,
			remainingCalories: 0
		};
		expect(() => getLogSchema.parse(invalid)).toThrow();
	});

	test('fails if knownCaloriesBurned is not an array', () => {
		const now = new Date();
		const invalid = {
			id: 'log1',
			createdAt: now,
			updatedAt: now,
			userId: 'user1',
			foodItems: [],
			knownCaloriesBurned: 'not-an-array',
			user: { BaseMetabolicRate: [] },
			totalCalories: 0,
			remainingCalories: 0
		};
		expect(() => getLogSchema.parse(invalid)).toThrow();
	});

	test('accepts optional logRemainder and comparisons', () => {
		const now = new Date();
		const valid = {
			id: 'log1',
			createdAt: now,
			updatedAt: now,
			userId: 'user1',
			foodItems: [],
			knownCaloriesBurned: [],
			logRemainder: [{ foo: 'bar' }],
			comparisons: { calories: 123 },
			user: { BaseMetabolicRate: [] },
			totalCalories: 0,
			remainingCalories: 0
		};
		expect(() => getLogSchema.parse(valid)).not.toThrow();
	});

	test('fails if user.BaseMetabolicRate is missing', () => {
		const now = new Date();
		const invalid = {
			id: 'log1',
			createdAt: now,
			updatedAt: now,
			userId: 'user1',
			foodItems: [],
			knownCaloriesBurned: [],
			user: {},
			totalCalories: 0,
			remainingCalories: 0
		};
		expect(() => getLogSchema.parse(invalid)).toThrow();
	});
});
