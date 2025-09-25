import {
	foodItemImageSchema,
	getFoodItemImageSchema,
	getPreparedDishImageSchema,
	getWaterConsumedSchema,
	preparedDishImageSchema,
	userSchema,
	waterConsumedSchema
} from '@/lib/validators';
import { z } from 'zod';
import {
	activityItemSchema,
	activityLogSchema,
	foodEntrySchema,
	foodItemSchema,
	getActivityItemSchema,
	getActivityLogSchema,
	getFoodEntrySchema,
	getFoodItemSchema,
	getGroceryItemSchema,
	getGroceryListSchema,
	getLogRemainderSchema,
	getLogSchema,
	getPreparedDishSchema,
	getReduxFoodItemSchema,
	getTrackingSchema,
	getUserNoteSchema,
	getUserSchema,
	groceryItemSchema,
	groceryListSchema,
	logRemainderSchema,
	logSchema,
	preparedDishSchema,
	trackingSchema,
	updateContentSchema,
	uploadedImageSchema,
	userNoteSchema
} from './../lib/validators';

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
export type RxFoodItem = z.infer<typeof getReduxFoodItemSchema>;

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

export type ActivityItem = z.infer<typeof activityItemSchema>;
export type GetActivityItem = z.infer<typeof getActivityItemSchema>;

export type ActivityLog = z.infer<typeof activityLogSchema>;
export type GetActivityLog = z.infer<typeof getActivityLogSchema>;

export type PreparedDish = z.infer<typeof preparedDishSchema>;
export type GetPreparedDish = z.infer<typeof getPreparedDishSchema>;

export type PreparedDishImage = z.infer<typeof preparedDishImageSchema>;
export type GetPreparedDishImage = z.infer<typeof getPreparedDishImageSchema>;

export type FoodItemImage = z.infer<typeof foodItemImageSchema>;
export type GetFoodItemImage = z.infer<typeof getFoodItemImageSchema>;

export type WaterConsumed = z.infer<typeof waterConsumedSchema>;

export type GetWaterConsumed = z.infer<typeof getWaterConsumedSchema>;

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

export type GetLogEnhanced = {
	user: {
		createdAt?: Date;
		updatedAt?: Date;
		BaseMetabolicRate: {
			bmr: number;
		}[];
	};
	knownCaloriesBurned: {
		calories: number;
	}[];
	logRemainder: {
		calories: number;
	}[];
} & {
	id: string;
	createdAt: Date;
	updatedAt: Date;
	userId: string;
	foodItems: {
		id: string;
		name: string;
		category: string;
		description: string | null;
		numServings: number;
		image: string | null;
		carbGrams: number;
		fatGrams: number;
		proteinGrams: number;
		calories: number;
		eatenAt: Date;
	}[];
};

export type GetLogDetailed = {
	comparisons: LogComparisonType;
	totalCalories: number;
	remainingCalories: number;
	user: {
		BaseMetabolicRate: {
			weight: number;
			weightUnit: string;
			height: number;
			heightUnit: string;
			age: number;
			sex: string;
			bmr: number;
		}[];
	} & {
		id: string;
		createdAt: Date;
		updatedAt: Date;
		name: string | null;
		image: string | null;
		email: string | null;
		emailVerified: Date | null;
		password: string | null;
		role: string;
	};
	knownCaloriesBurned: {
		calories: number;
	}[];
	logRemainder: {
		calories: number;
	}[];
	id: string;
	createdAt: Date;
	updatedAt: Date;
	userId: string;
	foodItems: {
		id: string;
		name: string;
		category: string;
		description: string | null;
		numServings: number;
		image: string | null;
		carbGrams: number;
		fatGrams: number;
		proteinGrams: number;
		calories: number;
		eatenAt: Date;
	}[];
};

export type MockedFunction<T extends (...args: any[]) => any> = jest.Mock<
	ReturnType<T>, // what it returns
	Parameters<T> // what it accepts
>;
