import {
	certificationSchema,
	codeBlockSchema,
	createContentSchema,
	createProjectSchema,
	emailSchema,
	getCertificationSchema,
	getCodeBlockSchema,
	getEmailSchema,
	getJobSchema,
	getProjectSchema,
	getTrackingSchema,
	getUserSchema,
	jobSchema,
	trackingSchema,
	updateContentSchema,
	uploadedImageSchema
} from './../lib/validators';
import { userSchema } from '@/lib/validators';
import { z } from 'zod';

export type User = z.infer<typeof userSchema>;
export type GetUser = z.infer<typeof getUserSchema>;

export type ContentPage = z.infer<typeof createContentSchema>;
export type UpdateContentPage = z.infer<typeof updateContentSchema>;

export type UploadedImage = z.infer<typeof uploadedImageSchema>;

export type Project = z.infer<typeof createProjectSchema>;
export type GetProject = z.infer<typeof getProjectSchema>;
export type CodeBlock = z.infer<typeof codeBlockSchema>;

export type GetCodeBlock = z.infer<typeof getCodeBlockSchema>;

export type Certification = z.infer<typeof certificationSchema>;
export type GetCertification = z.infer<typeof getCertificationSchema>;

export type Job = z.infer<typeof jobSchema>;
export type GetJob = z.infer<typeof getJobSchema>;

export type Tracking = z.infer<typeof trackingSchema>;
export type GetTracking = z.infer<typeof getTrackingSchema>;

export enum TechStack {
	JS = 'javascript',
	CSS = 'css',
	TAILWINDCSS = 'tailwindcss',
	REACT = 'react',
	NEXTJS = 'nextjs',
	PHP = 'php',
	PRISMA = 'prisma',
	GULP = 'gulp',
	BABEL = 'babel',
	WEBPACK = 'webpack',
	SASS = 'sass',
	LESS = 'less',
	HTML = 'html',
	POSTGRESQL = 'postgresql',
	MYSQL = 'mysql',
	MONGODB = 'mongodb',
	GATSBY = 'gatsby',
	GRAPHQL = 'graphql',
	GIT = 'git',
	NODEJS = 'nodeJS',
	DOCKER = 'docker',
	TYPESCRIPT = 'typescript',
	TSX = 'tsx',
	VUEJS = 'vuejs',
	VITEJS = 'vitejs',
	PYTHON = 'python'
}

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

export type Email = z.infer<typeof emailSchema>;

export type GetEmail = z.infer<typeof getEmailSchema>;
