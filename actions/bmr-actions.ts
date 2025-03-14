'use server';

import prisma from '@/db/prisma';
import { calculateBMR, formatError } from '@/lib/utils';
import { BMRData } from '@/types';
import { revalidatePath } from 'next/cache';

export async function addUserBMR(userId: string, bmrData: BMRData) {
	try {
		const existing = await prisma.baseMetabolicRate.findFirst({
			where: { userId }
		});

		if (existing) {
			return {
				success: false,
				message: 'The user BMR already exists'
			};
		}

		const newBMR = await prisma.baseMetabolicRate.create({
			data: {
				userId,
				weight: bmrData.weight,
				weightUnit: bmrData.weightUnit,
				height: bmrData.height,
				heightUnit: bmrData.heightUnit,
				age: bmrData.age,
				sex: bmrData.sex,
				bmr: calculateBMR(bmrData)
			}
		});

		if (!newBMR) {
			throw new Error('There was a problem creating the BMR data');
		}

		revalidatePath('/base-metabolic-rate');

		return {
			success: true,
			message: 'BMR successfully added'
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

export async function updateUserBMR(userId: string, bmrData: BMRData) {
	try {
		const existing = await prisma.baseMetabolicRate.findFirst({
			where: {
				userId
			}
		});

		if (!existing) {
			throw new Error('User BMR was not found');
		}

		const updateBMR = await prisma.baseMetabolicRate.update({
			where: {
				id: existing.id
			},
			data: {
				userId,
				weight: bmrData.weight,
				weightUnit: bmrData.weightUnit,
				height: bmrData.height,
				heightUnit: bmrData.heightUnit,
				age: bmrData.age,
				sex: bmrData.sex
			}
		});

		if (!updateBMR) {
			throw new Error('There was a problem updating BMR data');
		}

		revalidatePath('/base-metabolic-rate');

		return {
			success: true,
			message: 'BMR successfully updated'
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

export async function getBMRById(userId: string) {
	try {
		const existing = await prisma.baseMetabolicRate.findFirst({
			where: {
				userId
			}
		});

		if (!existing) {
			throw new Error('The BMR was not found for the user');
		}

		return {
			success: true,
			message: 'success',
			data: existing
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error),
			data: null
		};
	}
}
