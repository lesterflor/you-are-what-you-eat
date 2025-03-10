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
	role: z.string()
});

export const createContentSchema = z.object({
	id: z.string().optional(),
	title: z.string().min(1, 'Title is required'),
	slug: z.string().min(1, 'Slug is required'),
	content: z.string().min(1, 'Content is required'),
	image: z.string().optional(),
	category: z.string().optional(),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional()
});

export const updateContentSchema = z.object({
	id: z.string().optional(),
	title: z.string().min(1, 'Title is required'),
	slug: z.string().min(1, 'Slug is required'),
	content: z.string().min(1, 'Content is required'),
	image: z.string().optional()
	// category: z.string().optional()
});

export const uploadedImageSchema = z.object({
	id: z.string().optional(),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),
	src: z.string().min(1, 'src is required'),
	alt: z.string().optional(),
	title: z.string().optional(),
	projectId: z.string().optional().nullable(),
	description: z.string().optional(),
	type: z.string().min(1, 'type is required')
});

export const createProjectSchema = z.object({
	id: z.string().optional(),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),
	title: z.string().min(1, 'Title is required'),
	slug: z.string().min(1, 'Slug is required'),
	content: z.string().min(1, 'Content is required'),
	techStack: z.array(z.string()),
	techPackages: z.array(z.string()).optional(),
	gitHubRepo: z.string().optional(),
	gitHubRepoPublic: z.boolean().default(false)
});

export const getProjectSchema = z.object({
	id: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
	title: z.string(),
	slug: z.string(),
	content: z.string(),
	images: z.array(uploadedImageSchema),
	techStack: z.array(z.string()),
	techPackages: z.array(z.string()),
	codeBlocks: z.array(z.any()).optional(),
	gitHubRepo: z.string(),
	gitHubRepoPublic: z.boolean()
});

export const codeBlockSchema = z.object({
	id: z.string().optional(),
	createdAt: z.date().optional(),
	updatedAt: z.date().optional(),
	title: z.string().min(1, 'Title is required'),
	description: z.string().min(1, 'Description is required'),
	code: z.string().min(1, 'Code is required'),
	techStack: z.string().min(1, 'Tech stack is required'),
	projectId: z.string().optional().nullable(),
	showLineNumbers: z.boolean().default(true)
});

export const getCodeBlockSchema = z.object({
	id: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
	title: z.string(),
	description: z.string(),
	code: z.string(),
	techStack: z.string(),
	projectId: z.string(),
	showLineNumbers: z.boolean(),
	project: z.object({
		id: z.string(),
		title: z.string()
	})
});

export const certificationSchema = z.object({
	title: z.string().min(1, 'Title is required'),
	description: z.string().min(1, 'Description is required'),
	institution: z.string().min(1, 'Institution is required'),
	media: z.string().min(1, 'Media document is required'),
	date: z.date(),
	techStack: z.array(z.string()).optional()
});

export const getCertificationSchema = z.object({
	id: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
	title: z.string(),
	description: z.string(),
	institution: z.string(),
	media: z.string(),
	date: z.date(),
	techStack: z.array(z.string())
});

export const jobSchema = z.object({
	employer: z.string().min(1, 'Employer is required'),
	dateStarted: z.date(),
	dateEnded: z.date().optional().nullable(),
	slug: z.string().min(1, 'slug is required'),
	title: z.string().min(1, 'Job title is required'),
	location: z.string().min(1, 'Location i required'),
	techStack: z.array(z.string()),
	description: z.string().min(1, 'Description is required'),
	logo: z.string().optional(),
	link: z.string().optional()
});

export const getJobSchema = z.object({
	id: z.string(),
	createdAt: z.date(),
	updatedAt: z.date(),
	employer: z.string(),
	dateStarted: z.date(),
	dateEnded: z.date(),
	title: z.string(),
	location: z.string(),
	description: z.string(),
	slug: z.string(),
	techStack: z.array(z.string()),
	projects: getProjectSchema.optional(),
	logo: z.string(),
	link: z.string()
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

export const emailSchema = z.object({
	name: z.string().min(1, 'Your name is required'),
	email: z.string().min(1, 'Email is required'),
	message: z.string().min(3, 'Message is required'),
	trackingId: z.string().min(1, 'id is required')
});

export const getEmailSchema = z.object({
	id: z.string(),
	createdAt: z.date(),
	name: z.string(),
	email: z.string(),
	message: z.string(),
	trackingId: z.string().optional(),
	tracking: getTrackingSchema.optional()
});
