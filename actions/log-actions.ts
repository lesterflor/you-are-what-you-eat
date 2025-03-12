'use server';

import { auth } from '@/db/auth';
import prisma from '@/db/prisma';
import { formatError, getToday } from '@/lib/utils';
import { FoodEntry } from '@/types';
import { revalidatePath } from 'next/cache';

export async function createDailyLog() {
	const session = await auth();
	const user = session?.user;

	if (!session || !user) {
		return;
	}

	// first check if there are any logs for today
	try {
		let logForToday;

		const todaysLog = await prisma.log.findFirst({
			where: {
				userId: user.id,
				createdAt: {
					gte: getToday().todayStart,
					lte: getToday().todayEnd
				}
			}
		});

		// there hasn't been a log created for today - create a new one
		if (!todaysLog) {
			const newLog = await prisma.log.create({
				data: {
					userId: user.id as string
				}
			});

			logForToday = newLog;
		} else {
			logForToday = todaysLog;
		}

		return {
			success: true,
			message: 'success',
			data: logForToday
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error),
			data: null
		};
	}
}

export async function updateLog(foodEntries: FoodEntry[]) {
	const session = await auth();
	const user = session?.user;

	if (!user) {
		throw new Error('User is not authenticated');
	}

	try {
		let logUpdate;

		const existing = await prisma.log.findFirst({
			where: {
				userId: user.id,
				createdAt: {
					gte: getToday().todayStart,
					lte: getToday().todayEnd
				}
			}
		});

		if (!existing) {
			const newLog = await createDailyLog();

			logUpdate = newLog?.data;
		} else {
			logUpdate = existing;
		}

		const update = await prisma.log.update({
			where: {
				id: logUpdate?.id
			},
			data: {
				foodItems: foodEntries
			}
		});

		if (!update) {
			throw new Error('There was a problem updating the log');
		}

		revalidatePath('/foods');

		return {
			success: true,
			message: 'success'
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}
