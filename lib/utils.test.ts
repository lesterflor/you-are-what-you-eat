import { afterEach, beforeEach, describe, expect, test } from '@jest/globals';
import {
	addOneDay,
	calculateBMR,
	calculateWaterIntake,
	CM_TO_FEET,
	CM_TO_INCH,
	cn,
	colateBMRData,
	convertGlassesOfWater,
	FEET_TO_CM,
	formatDateTime,
	formatError,
	formatUnit,
	generateMacroComparisons,
	getMacroPercOfCals,
	getStorageItem,
	getToday,
	GRAMS_TO_POUND,
	INCH_TO_CM,
	isToday,
	POUND_TO_KILO,
	RADIAN,
	sanitizeHtmlConfig,
	setStorageItem,
	shuffle,
	totalCalorieReducer,
	totalMacrosReducer,
	truncate
} from './utils';

describe('getStorageItem and setStorageItem', () => {
	let originalWindow: any;

	beforeEach(() => {
		originalWindow = global.window;
		if (!global.window) {
			(global as any).window = {};
		}
		Object.defineProperty(global.window, 'localStorage', {
			value: {
				getItem: jest.fn(),
				setItem: jest.fn()
			},
			writable: true
		});
	});

	afterEach(() => {
		global.window = originalWindow;
	});

	test('returns parsed value when item exists', () => {
		const value = { foo: 'bar' };
		(global.window.localStorage.getItem as jest.Mock).mockReturnValue(
			JSON.stringify(value)
		);
		expect(getStorageItem('testKey')).toEqual(value);
	});

	test('returns null when item does not exist', () => {
		(global.window.localStorage.getItem as jest.Mock).mockReturnValue(null);
		expect(getStorageItem('missingKey')).toBeNull();
	});

	test('setStorageItem stores stringified value', () => {
		setStorageItem('myKey', { a: 1 });
		expect(global.window.localStorage.setItem).toHaveBeenCalledWith(
			'myKey',
			JSON.stringify({ a: 1 })
		);
	});
});

describe('cn', () => {
	test('merges class names', () => {
		expect(cn('a', 'b')).toContain('a');
		expect(cn('a', 'b')).toContain('b');
	});
});

describe('formatError', () => {
	test('formats ZodError', () => {
		const error = {
			name: 'ZodError',
			errors: {
				field1: { message: 'Field1 error' },
				field2: { message: 'Field2 error' }
			}
		};
		expect(formatError(error)).toContain('Field1 error');
		expect(formatError(error)).toContain('Field2 error');
	});

	test('formats PrismaClientKnownRequestError', () => {
		const error = {
			name: 'PrismaClientKnownRequestError',
			code: 'P2002',
			meta: { target: ['email'] }
		};
		expect(formatError(error)).toBe('Email already exists');
	});

	test('formats generic error', () => {
		const error = { name: 'Other', message: 'Something went wrong' };
		expect(formatError(error)).toBe('Something went wrong');
	});
});

describe('formatDateTime', () => {
	test('formats date string', () => {
		const result = formatDateTime(new Date('2023-01-01T12:34:00Z'));
		expect(result).toHaveProperty('dateTime');
		expect(result).toHaveProperty('dateOnly');
		expect(result).toHaveProperty('dateWithoutDay');
		expect(result).toHaveProperty('timeOnly');
		expect(result).toHaveProperty('dateString');
	});
});

describe('shuffle', () => {
	test('shuffles array', () => {
		const arr = [1, 2, 3, 4, 5];
		const copy = [...arr];
		shuffle(arr);
		expect(arr.sort()).toEqual(copy.sort());
	});
});

describe('isToday', () => {
	test('returns true for today', () => {
		expect(isToday(new Date())).toBe(true);
	});
	test('returns false for yesterday', () => {
		const d = new Date();
		d.setDate(d.getDate() - 1);
		expect(isToday(d)).toBe(false);
	});
});

describe('getToday', () => {
	test('returns today/yesterday/start/end', () => {
		const result = getToday();
		expect(result).toHaveProperty('yesterday');
		expect(result).toHaveProperty('current');
		expect(result).toHaveProperty('todayStart');
		expect(result).toHaveProperty('todayEnd');
		expect(result).toHaveProperty('offset');
	});
});

describe('addOneDay', () => {
	test('adds one day', () => {
		const d = new Date('2023-01-15');
		const next = addOneDay(d);
		expect(next.getDate()).toBe(d.getDate() + 1);
	});
});

describe('totalCalorieReducer', () => {
	test('sums calories', () => {
		const items = [
			{ calories: 100 },
			{ calories: 200 },
			{ calories: 50 }
		] as any;
		expect(totalCalorieReducer(items)).toBe(350);
	});
});

describe('totalMacrosReducer', () => {
	test('sums macros', () => {
		const items = [
			{
				calories: 100,
				carbGrams: 10,
				fatGrams: 5,
				proteinGrams: 7,
				numServings: 2
			},
			{
				calories: 200,
				carbGrams: 20,
				fatGrams: 10,
				proteinGrams: 14,
				numServings: 1
			}
		] as any;
		const result = totalMacrosReducer(items);
		expect(result.calories).toBe(Math.round(100 * 2 + 200 * 1));
		expect(result.carbs).toBe(10 * 2 + 20 * 1);
		expect(result.fat).toBe(5 * 2 + 10 * 1);
		expect(result.protein).toBe(7 * 2 + 14 * 1);
	});
});

describe('calculateBMR', () => {
	test('calculates BMR for male', () => {
		const data = {
			weight: 150,
			weightUnit: 'pound',
			height: 70,
			heightUnit: 'inch',
			age: 30,
			sex: 'male'
		};
		expect(typeof calculateBMR(data as any)).toBe('number');
	});
	test('calculates BMR for female', () => {
		const data = {
			weight: 150,
			weightUnit: 'pound',
			height: 70,
			heightUnit: 'inch',
			age: 30,
			sex: 'female'
		};
		expect(typeof calculateBMR(data as any)).toBe('number');
	});
});

describe('colateBMRData', () => {
	test('returns colated data', () => {
		const data = {
			weight: 150,
			weightUnit: 'pound',
			height: 170,
			heightUnit: 'cm',
			age: 30,
			sex: 'male'
		};
		const result = colateBMRData(data as any);
		expect(result).toHaveProperty('weightInPounds');
		expect(result).toHaveProperty('weightInKilos');
		expect(result).toHaveProperty('heightInInches');
		expect(result).toHaveProperty('heightInFeet');
		expect(result).toHaveProperty('heightInCm');
	});
});

describe('formatUnit', () => {
	test('formats with precision', () => {
		expect(formatUnit(1.2345, 100)).toBeCloseTo(1.23, 2);
	});
});

describe('getMacroPercOfCals', () => {
	test('returns percent string', () => {
		expect(getMacroPercOfCals(10, 100, 'protein')).toBe('40%');
		expect(getMacroPercOfCals(0, 0, 'protein')).toBe('');
	});
});

describe('truncate', () => {
	test('truncates long string', () => {
		expect(truncate('abcdef', 4)).toBe('a…');
	});
	test('does not truncate short string', () => {
		expect(truncate('abc', 10)).toBe('abc');
	});
});

describe('calculateWaterIntake', () => {
	test('calculates water intake', () => {
		const result = calculateWaterIntake(155);
		expect(result).toHaveProperty('ounces');
		expect(result).toHaveProperty('litres');
		expect(result).toHaveProperty('glasses');
	});
});

describe('convertGlassesOfWater', () => {
	test('converts glasses to ounces and litres', () => {
		const result = convertGlassesOfWater(8);
		expect(result.glasses).toBe(8);
		expect(result.ounces).toBeCloseTo(80, 1);
		expect(result.litres).toBeCloseTo(1.18, 1);
	});
});

describe('generateMacroComparisons', () => {
	test('compares macros', () => {
		const today = [
			{
				calories: 100,
				carbGrams: 10,
				fatGrams: 5,
				proteinGrams: 7,
				numServings: 1
			}
		] as any;
		const yesterday = [
			{
				calories: 200,
				carbGrams: 20,
				fatGrams: 10,
				proteinGrams: 14,
				numServings: 1
			}
		] as any;
		const result = generateMacroComparisons(today, yesterday);
		expect(result.calories.today).toBe(100);
		expect(result.calories.yesterday).toBe(200);
		expect(result.calories.belowYesterday).toBe(true);
	});
});

describe('constants', () => {
	test('constants are numbers', () => {
		expect(typeof POUND_TO_KILO).toBe('number');
		expect(typeof INCH_TO_CM).toBe('number');
		expect(typeof CM_TO_INCH).toBe('number');
		expect(typeof CM_TO_FEET).toBe('number');
		expect(typeof FEET_TO_CM).toBe('number');
		expect(typeof GRAMS_TO_POUND).toBe('number');
		expect(typeof RADIAN).toBe('number');
	});
});

describe('sanitizeHtmlConfig', () => {
	test('has allowedTags and allowedAttributes', () => {
		expect(Array.isArray(sanitizeHtmlConfig.allowedTags)).toBe(true);
		expect(typeof sanitizeHtmlConfig.allowedAttributes).toBe('object');
	});
});
