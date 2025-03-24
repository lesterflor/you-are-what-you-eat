import { BMRData, ColatedBMRData, GetFoodEntry, MacroType } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// format errors
export function formatError(error: any) {
	if (error.name === 'ZodError') {
		const fieldErrors = Object.keys(error.errors).map(
			(field) => error.errors[field].message
		);

		return fieldErrors.join('. ');
	} else if (
		error.name === 'PrismaClientKnownRequestError' &&
		error.code === 'P2002'
	) {
		const field = error.meta?.target ? error.meta.target[0] : 'Field';

		return `${field[0].toUpperCase() + field.slice(1)} already exists`;
	} else {
		return typeof error.message === 'string'
			? error.message
			: JSON.stringify(error.message);
	}
}

export const formatDateTime = (dateString: Date) => {
	const dateTimeOptions: Intl.DateTimeFormatOptions = {
		month: 'short', // abbreviated month name (e.g., 'Oct')
		year: 'numeric', // abbreviated month name (e.g., 'Oct')
		day: 'numeric', // numeric day of the month (e.g., '25')
		hour: 'numeric', // numeric hour (e.g., '8')
		minute: 'numeric', // numeric minute (e.g., '30')
		hour12: true // use 12-hour clock (true) or 24-hour clock (false)
	};
	const dateOptions: Intl.DateTimeFormatOptions = {
		weekday: 'short', // abbreviated weekday name (e.g., 'Mon')
		month: 'short', // abbreviated month name (e.g., 'Oct')
		year: 'numeric', // numeric year (e.g., '2023')
		day: 'numeric' // numeric day of the month (e.g., '25')
	};
	const dateOptionsNoDay: Intl.DateTimeFormatOptions = {
		month: 'short', // abbreviated month name (e.g., 'Oct')
		year: 'numeric', // numeric year (e.g., '2023')
		day: 'numeric' // numeric day of the month (e.g., '25')
	};
	const dateOptionsString: Intl.DateTimeFormatOptions = {
		month: 'numeric', // abbreviated month name (e.g., 'Oct')
		year: 'numeric', // numeric year (e.g., '2023')
		day: 'numeric' // numeric day of the month (e.g., '25')
	};
	const timeOptions: Intl.DateTimeFormatOptions = {
		hour: 'numeric', // numeric hour (e.g., '8')
		minute: 'numeric', // numeric minute (e.g., '30')
		hour12: true // use 12-hour clock (true) or 24-hour clock (false)
	};
	const formattedDateTime: string = new Date(dateString).toLocaleString(
		'en-US',
		dateTimeOptions
	);
	const formattedDate: string = new Date(dateString).toLocaleString(
		'en-US',
		dateOptions
	);
	const formattedDateString: string = new Date(dateString).toLocaleString(
		'en-US',
		dateOptionsString
	);
	const formattedDateOnly: string = new Date(dateString).toLocaleString(
		'en-US',
		dateOptionsNoDay
	);
	const formattedTime: string = new Date(dateString).toLocaleString(
		'en-US',
		timeOptions
	);
	return {
		dateTime: formattedDateTime,
		dateOnly: formattedDate,
		dateWithoutDay: formattedDateOnly,
		timeOnly: formattedTime,
		dateString: formattedDateString
	};
};

export function shuffle(array: any[]) {
	let currentIndex = array.length;

	// While there remain elements to shuffle...
	while (currentIndex != 0) {
		// Pick a remaining element...
		const randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [
			array[randomIndex],
			array[currentIndex]
		];
	}
}

export function setStorageItem(name: string, value: any) {
	localStorage.setItem(name, JSON.stringify(value));
}

export function getStorageItem(name: string) {
	const data = localStorage.getItem(name);

	if (data) {
		return JSON.parse(data);
	}

	return null;
}

export const sanitizeHtmlConfig = {
	allowedTags: [
		'address',
		'article',
		'aside',
		'footer',
		'header',
		'h1',
		'h2',
		'h3',
		'h4',
		'h5',
		'h6',
		'hgroup',
		'main',
		'nav',
		'section',
		'blockquote',
		'dd',
		'div',
		'dl',
		'dt',
		'figcaption',
		'figure',
		'hr',
		'li',
		'main',
		'ol',
		'p',
		'pre',
		'ul',
		'a',
		'abbr',
		'b',
		'bdi',
		'bdo',
		'br',
		'cite',
		'code',
		'i',
		'span',
		'strong',
		'sub',
		'sup',
		'time',
		'u',
		'wbr',
		'caption'
	],
	allowedAttributes: {
		a: ['href', 'target'],
		p: ['class']
	},
	allowedSchemes: ['http', 'https', 'mailto', 'tel'],
	nonTextTags: ['style', 'script', 'textarea', 'option', 'noscript']
};

export function isToday(date: Date) {
	const now = new Date();
	return (
		date.getDate() === now.getDate() &&
		date.getMonth() === now.getMonth() &&
		date.getFullYear() === now.getFullYear()
	);
}

export function getToday(hourAdjustment: number = 4) {
	const serverAdjustedDate = new Date(
		new Date().setHours(new Date().getHours() - hourAdjustment)
	);

	const timezoneOffset = serverAdjustedDate.getTimezoneOffset();

	const todayStart = new Date(
		serverAdjustedDate.getFullYear(),
		serverAdjustedDate.getMonth(),
		serverAdjustedDate.getDate()
	);

	const yesterday = new Date(
		serverAdjustedDate.getFullYear(),
		serverAdjustedDate.getMonth(),
		serverAdjustedDate.getDate() - 1
	);

	const todayEnd = new Date(
		serverAdjustedDate.getFullYear(),
		serverAdjustedDate.getMonth(),
		serverAdjustedDate.getDate() + 1
	);

	const adjustedCurrent = serverAdjustedDate.setHours(
		serverAdjustedDate.getHours() + timezoneOffset / 60
	);

	return {
		yesterday,
		current: adjustedCurrent,
		todayStart: todayStart.toISOString(),
		todayEnd: todayEnd.toISOString(),
		offset: timezoneOffset / 60
	};
}

export function addOneDay(date: Date) {
	const dateCopy = new Date(date);
	dateCopy.setDate(date.getDate() + 1);
	return dateCopy;
}

export function totalCalorieReducer(items: GetFoodEntry[]) {
	return items.reduce((acc, curr) => acc + curr.calories, 0);
}

export function totalMacrosReducer(items: GetFoodEntry[]) {
	return {
		calories: Math.round(
			items.reduce((acc, curr) => {
				const sub = curr.calories * curr.numServings;
				return acc + sub;
			}, 0)
		),
		carbs: items.reduce((acc, curr) => {
			const sub = curr.carbGrams * curr.numServings;
			return acc + sub;
		}, 0),
		fat: items.reduce((acc, curr) => {
			const sub = curr.fatGrams * curr.numServings;
			return acc + sub;
		}, 0),
		protein: items.reduce((acc, curr) => {
			const sub = curr.proteinGrams * curr.numServings;
			return acc + sub;
		}, 0)
	};
}

/* 
Another formula, the Mifflin-St Jeor equation, is considered even more accurate by the American Dietetic Association (ADA) in 2005.
 For men, it is BMR = 10 × weightinkg + 6.25 × heightincm − 5 × ageinyears + 5.
 For women, the formula is BMR = 10 × weightinkg + 6.25 × heightincm − 5 × ageinyears − 161. 

 1 lb = 0.4535924 kg

 1 inch = 2.54 cm

 height in cm = 170.18

 weight in kilo = 71.6675992

 BMR = 10 * 71.6675992 + 6.25 * 170.18 - 5 * 50 + 5
 */

export const POUND_TO_KILO = 0.4535924;
export const INCH_TO_CM = 2.54;
export const CM_TO_INCH = 0.3937008;
export const CM_TO_FEET = 0.0328084;
export const FEET_TO_CM = 30.48;
export const GRAMS_TO_POUND = 0.002204623;
export const RADIAN = Math.PI / 180;

export function calculateBMR(data: BMRData) {
	const {
		weight = 0,
		weightUnit = 'pound',
		height = 0,
		heightUnit = 'inch',
		age = 0,
		sex = 'male'
	} = data;

	const actualWeight = weightUnit === 'pound' ? weight * POUND_TO_KILO : weight;

	const actualHeight = heightUnit === 'inch' ? height * INCH_TO_CM : height;

	const formula =
		sex === 'male'
			? 10 * actualWeight + 6.25 * actualHeight - 5 * age + 5
			: 10 * actualHeight + 6.25 * actualHeight - 5 * age - 161;

	return Number(formula.toFixed(2));
}

export function colateBMRData(data: BMRData): ColatedBMRData {
	const { age, weight, weightUnit, height, heightUnit, sex } = data;

	const inchesFromCM = height / INCH_TO_CM;
	const inchesToFeetAndInches = inchesFromCM / 12;
	const remainderInches =
		inchesToFeetAndInches - Math.floor(inchesToFeetAndInches);
	const correctRemainder = Math.round(remainderInches * 12);

	return {
		weightInPounds: weightUnit === 'pound' ? weight : weight / POUND_TO_KILO,
		weightInKilos: weightUnit === 'kilo' ? weight : weight * POUND_TO_KILO,
		weightUnit,
		heightInInches: heightUnit === 'cm' ? correctRemainder : height,
		heightInFeet:
			heightUnit === 'cm' ? Math.floor(inchesToFeetAndInches) : height / 12,
		heightInCm:
			heightUnit === 'cm' ? Math.round(height * 10) / 10 : height * INCH_TO_CM,
		heightUnit,
		age,
		sex
	};
}

export function formatUnit(val: number, precision: number = 10) {
	return Math.round(val * precision) / precision;
}

export function getMacroPercOfCals(
	macGrams: number,
	totalCals: number,
	type: MacroType
) {
	const mType = {
		protein: 4,
		carb: 4,
		fat: 9
	};
	const macCals = macGrams * mType[type];
	const pre = macCals / totalCals;
	const prec = formatUnit(pre * 100, 10);
	return isNaN(prec) ? '' : prec + '%';
}

export function truncate(str: string, maxlength: typeof Infinity) {
	return str.length > maxlength ? str.slice(0, maxlength - 3) + '…' : str;
}
