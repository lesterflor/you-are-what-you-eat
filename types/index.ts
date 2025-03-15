import {
	foodEntrySchema,
	foodItemSchema,
	getFoodEntrySchema,
	getFoodItemSchema,
	getLogSchema,
	getTrackingSchema,
	getUserSchema,
	logSchema,
	trackingSchema,
	updateContentSchema,
	uploadedImageSchema
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

export type FoodItem = z.infer<typeof foodItemSchema>;
export type GetFoodItem = z.infer<typeof getFoodItemSchema>;

export type Log = z.infer<typeof logSchema>;
export type GetLog = z.infer<typeof getLogSchema>;

export type FoodEntry = z.infer<typeof foodEntrySchema>;
export type GetFoodEntry = z.infer<typeof getFoodEntrySchema>;

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
