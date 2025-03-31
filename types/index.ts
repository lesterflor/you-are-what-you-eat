import {
	foodEntrySchema,
	foodItemSchema,
	getFoodEntrySchema,
	getFoodItemSchema,
	getGroceryItemSchema,
	getGroceryListSchema,
	getLogRemainderSchema,
	getLogSchema,
	getTrackingSchema,
	getUserNoteSchema,
	getUserSchema,
	groceryItemSchema,
	groceryListSchema,
	logRemainderSchema,
	logSchema,
	trackingSchema,
	updateContentSchema,
	uploadedImageSchema,
	userNoteSchema
} from './../lib/validators';
import { userSchema } from '@/lib/validators';
import { z } from 'zod';

export type User = z.infer<typeof userSchema>;
export type GetUser = z.infer<typeof getUserSchema>;

export type UpdateContentPage = z.infer<typeof updateContentSchema>;

export type UploadedImage = z.infer<typeof uploadedImageSchema>;

export type Tracking = z.infer<typeof trackingSchema>;
export type GetTracking = z.infer<typeof getTrackingSchema>;

export type TrackingItemType = {
	status: string;
	country: string;
	countryCode: string;
	region: string;
	regionName: string;
	city: string;
	zip: string;
	lat: string;
	lon: string;
	timezone: string;
	isp: string;
	org: string;
	as: string;
	query: string;
};

export type TrackingType = 'page' | 'form';
export type GroceryListStatus = 'pending' | 'completed';

export type FoodItem = z.infer<typeof foodItemSchema>;
export type GetFoodItem = z.infer<typeof getFoodItemSchema>;

export type Log = z.infer<typeof logSchema>;
export type GetLog = z.infer<typeof getLogSchema>;

export type FoodEntry = z.infer<typeof foodEntrySchema>;
export type GetFoodEntry = z.infer<typeof getFoodEntrySchema>;

export type LogRemainder = z.infer<typeof logRemainderSchema>;
export type GetLogRemainder = z.infer<typeof getLogRemainderSchema>;

export type UserNote = z.infer<typeof userNoteSchema>;
export type GetUserNote = z.infer<typeof getUserNoteSchema>;

export type GroceryList = z.infer<typeof groceryListSchema>;
export type GetGroceryList = z.infer<typeof getGroceryListSchema>;

export type GroceryItem = z.infer<typeof groceryItemSchema>;
export type GetGroceryItem = z.infer<typeof getGroceryItemSchema>;

export type BMRData = {
	weight: number;
	weightUnit: 'pound' | 'kilo';
	height: number;
	heightUnit: 'inch' | 'cm';
	age: number;
	sex: 'male' | 'female';
};

export type ColatedBMRData = {
	weightInPounds: number;
	weightInKilos: number;
	weightUnit: 'pound' | 'kilo';
	heightInInches: number;
	heightInFeet: number;
	heightInCm: number;
	heightUnit: 'inch' | 'cm';
	age: number;
	sex: 'male' | 'female';
};

export type MacroType = 'protein' | 'carb' | 'fat';

export type BaseMetabolicRateType = {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	userId: string;
	weight: number;
	weightUnit: string;
	height: number;
	heightUnit: string;
	age: number;
	sex: string;
	bmr: number;
};

export type GetKnowCaloriesBurned = {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	calories: number;
	userId: string;
};

export type PieItemType = {
	name: string;
	value: number;
	fill: string;
};

export type LogDataType = {
	eatenAt: string;
	calories: number;
	carb: number;
	protein: number;
	fat: number;
	totalGrams: number;
};

export type DayLogDataType = {
	day: string;
	Calories: number;
	carb: number;
	protein: number;
	fat: number;
	totalGrams: number;
	Expended: number;
};

export type LogRemainderDataType = {
	remainder: number;
	yesterdaysConsumed: number;
	todaysConsumed: number;
	bmr: number;
	yesterdaysExpended: number;
	yesterdaysRemainder: number;
};

export type LogComparisonType = {
	calories: {
		yesterday: number;
		today: number;
		belowYesterday: boolean;
	};
	protein: {
		yesterday: number;
		today: number;
		belowYesterday: boolean;
	};
	carbs: {
		yesterday: number;
		today: number;
		belowYesterday: boolean;
	};
	fat: {
		yesterday: number;
		today: number;
		belowYesterday: boolean;
	};
} | null;
