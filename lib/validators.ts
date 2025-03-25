import { z } from 'zod';

// schema for signing users in
export const signInFormSchema = z.object({
	email: z.string().email('Invalid email address'),
	password: z.string().min(6, 'Password must be at least 6 characters')
});

// schema for signing up users
export const signUpFormSchema = z
	.object({
		name: z.string().min(3, 'Name must be at least 3 characters'),
		email: z.string().email('Invalid email address'),
		password: z.string().min(6, 'Password must be at least 6 characters'),
		confirmPassword: z
			.string()
			.min(6, 'Confirm password must be at least 6 characters')
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword']
	});

export const updateProfileSchema = z.object({
	name: z.string().min(3, 'Name must be at least 3 characters'),
	email: z.string().min(3, 'Email must be at least 3 characters'),
	image: z.string().optional()
});

// schema to update user
export const updateUserSchema = updateProfileSchema.extend({
	id: z.string().min(1, 'Id is required'),
	role: z.string().min(1, 'Role is required')
});

export const userSchema = z.object({
	name: z.string(),
	email: z.string().optional(),
	image: z.string().optional(),
	role: z.string().optional()
});

export const getUserSchema = z.object({
	id: z.string(),
	name: z.string(),
	email: z.string(),
	image: z.string(),
	role: z.string(),
	logs: z.array(z.any()),
	userNotes: z.array(z.any())
});

export const updateContentSchema = z.object({
	id: z.string().optional(),
	title: z.string().min(1, 'Title is required'),
	slug: z.string().min(1, 'Slug is required'),
	content: z.string().min(1, 'Content is required'),
	image: z.string().optional()
});

export const uploadedImageSchema = z.object({
	id: z.string().optional(),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),
	src: z.string().min(1, 'src is required'),
	alt: z.string().optional(),
	title: z.string().optional(),
	description: z.string().optional(),
	type: z.string().min(1, 'type is required')
});

export const trackingSchema = z.object({
	type: z.string().min(1, 'type is required'),
	value: z.string().min(1, 'value is required'),
	ip: z.string().min(1, 'IP is required'),
	country: z.string().min(1, 'country required'),
	countryCode: z.string().min(1, 'countryCode required'),
	region: z.string().min(1, 'countryRegion required'),
	regionName: z.string().min(1, 'regionName required'),
	city: z.string().min(1, 'city required'),
	zip: z.string().min(1, 'zip required'),
	lat: z.string().min(1, 'lat required'),
	lon: z.string().min(1, 'lon required'),
	timezone: z.string().min(1, 'timezone required'),
	isp: z.string().min(1, 'isp required'),
	org: z.string().min(1, 'org required'),
	as: z.string().min(1, 'as required'),
	numVisits: z.number().optional()
});

export const getTrackingSchema = z.object({
	id: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
	type: z.string(),
	value: z.string(),
	ip: z.string(),
	country: z.string(),
	countryCode: z.string(),
	region: z.string(),
	regionName: z.string(),
	city: z.string(),
	zip: z.string(),
	lat: z.string(),
	lon: z.string(),
	timezone: z.string(),
	isp: z.string(),
	org: z.string(),
	as: z.string(),
	numVisits: z.number()
});

export const foodItemSchema = z.object({
	name: z.string().min(1, 'Name is required'),
	category: z.string().min(1, 'Category is required'),
	image: z.string().optional(),
	carbGrams: z
		.number()
		.nullable()
		.refine((val) => val !== null, { message: 'Carbs can be 0 or greater.' }),
	fatGrams: z
		.number()
		.nullable()
		.refine((val) => val !== null, { message: 'Fats can be 0 or greater.' }),
	proteinGrams: z
		.number()
		.nullable()
		.refine((val) => val !== null, { message: 'Protein can be 0 or greater.' }),
	calories: z
		.number()
		.nullable()
		.refine((val) => val !== null, {
			message: 'Calories can be 0 or greater.'
		}),
	description: z.string().optional(),
	servingSize: z.number().optional(),
	userId: z.string().optional()
});

export const getFoodItemSchema = z.object({
	id: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
	name: z.string(),
	category: z.string(),
	image: z.string(),
	carbGrams: z.number(),
	fatGrams: z.number(),
	proteinGrams: z.number(),
	calories: z.number(),
	description: z.string(),
	servingSize: z.number(),
	userId: z.string().optional(),
	//user: getUserSchema.optional()
	user: z.any()
});

export const foodEntrySchema = z.object({
	id: z.string(),
	name: z.string(),
	category: z.string(),
	description: z.string(),
	numServings: z.number().refine((val) => val !== null, {
		message: 'Number of servings can be 1 or greater.'
	}),
	image: z.string(),
	carbGrams: z.number().refine((val) => val !== null, {
		message: 'Carbs can be 0 or greater.'
	}),
	proteinGrams: z.number().refine((val) => val !== null, {
		message: 'Protein can be 0 or greater.'
	}),
	fatGrams: z.number().refine((val) => val !== null, {
		message: 'Fat can be 0 or greater.'
	}),
	calories: z.number().refine((val) => val !== null, {
		message: 'Calories can be 0 or greater.'
	}),
	eatenAt: z.date()
});

export const getFoodEntrySchema = z.object({
	id: z.string(),
	name: z.string(),
	category: z.string(),
	description: z.string(),
	numServings: z.number(),
	image: z.string(),
	carbGrams: z.number(),
	proteinGrams: z.number(),
	fatGrams: z.number(),
	calories: z.number(),
	eatenAt: z.date()
});

export const getKnownCaloriesBurnedSchema = z.object({
	id: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
	userId: z.string(),
	logId: z.string(),
	calories: z.number()
});

export const logSchema = z.object({
	userId: z.string().min(1, 'User is required'),
	foodItems: z.array(foodEntrySchema)
});

export const getLogSchema = z.object({
	id: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
	userId: z.string(),
	foodItems: z.array(getFoodEntrySchema),
	knownCaloriesBurned: z.array(getKnownCaloriesBurnedSchema),
	logRemainder: z.array(z.any()).optional()
});

export const logRemainderSchema = z.object({
	userId: z.string().min(1, 'userId is required'),
	logId: z.string().min(1, 'logId is required'),
	calories: z.number().refine((val) => val !== null, {
		message: 'Calories can be 0 or greater.'
	})
});

export const getLogRemainderSchema = z.object({
	id: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
	calories: z.number(),
	logId: z.string(),
	log: getLogSchema.optional(),
	userId: z.string(),
	user: getUserSchema.optional()
});

export const userNoteSchema = z.object({
	title: z.string().optional(),
	note: z.string().min(1, 'note is required'),
	userId: z.string().min(1, 'userId is required')
});

export const getUserNoteSchema = z.object({
	id: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
	title: z.string().optional(),
	note: z.string(),
	userId: z.string()
});
