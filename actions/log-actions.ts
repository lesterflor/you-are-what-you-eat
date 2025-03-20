'use server';

import { auth } from '@/db/auth';
import prisma from '@/db/prisma';
import { formatError, getToday } from '@/lib/utils';
import { FoodEntry, GetFoodEntry, GetUser } from '@/types';
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
					lt: getToday().todayEnd
				}
			},
			include: {
				user: {
					include: {
						BaseMetabolicRate: true
					}
				},
				knownCaloriesBurned: true
			}
		});

		// there hasn't been a log created for today - create a new one
		if (!todaysLog) {
			const newLog = await prisma.log.create({
				data: {
					userId: user.id as string
				},
				include: {
					user: {
						include: {
							BaseMetabolicRate: true
						}
					},
					knownCaloriesBurned: true
				}
			});

			logForToday = newLog;
		} else {
			logForToday = todaysLog;
		}

		createKnowDailyCalories(logForToday.id);

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
					lt: getToday().todayEnd
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

		revalidatePath('/');

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

export async function getLogsByUserId(id: string) {
	try {
		const logs = await prisma.log.findMany({
			where: {
				userId: id,
				NOT: [
					{
						createdAt: {
							gte: getToday().todayStart,
							lt: getToday().todayEnd
						}
					}
				]
			},
			include: { knownCaloriesBurned: true },
			orderBy: {
				createdAt: 'desc'
			}
		});

		if (!logs) {
			throw new Error('There was a problem fetching logs for user');
		}

		return {
			success: true,
			message: 'success',
			data: logs
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error),
			data: null
		};
	}
}

export async function createKnowDailyCalories(logId: string) {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session || !user) {
			throw new Error('User must be authenticated');
		}

		const existing = await prisma.knownCaloriesBurned.findFirst({
			where: {
				logId,
				userId: user.id,
				createdAt: {
					gte: getToday().todayStart,
					lt: getToday().todayEnd
				}
			}
		});

		if (!existing) {
			const newKDC = await prisma.knownCaloriesBurned.create({
				data: {
					logId,
					userId: user.id
				}
			});

			if (!newKDC) {
				throw new Error(
					'There was a problem creating the Known Calories Burned'
				);
			}
		}

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

export async function addKnownCaloriesBurned(calories: number) {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session || !user) {
			throw new Error('User must be authenticated');
		}

		const currentLog = await createDailyLog();

		if (!currentLog?.data) {
			throw new Error('There was a problem getting the most recent log');
		}

		// technically there should only be 1 item for every log
		const { id, calories: existingCalories } =
			currentLog.data.knownCaloriesBurned[0];

		const update = await prisma.knownCaloriesBurned.update({
			where: {
				id
			},
			data: {
				calories: existingCalories + calories
			}
		});

		if (!update) {
			throw new Error('There was a problem updating the Known Calories Burned');
		}

		return {
			success: true,
			message: 'Updated Calories Burned'
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

export async function deleteFoodLogEntry(foodEntryId: string) {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session || !user) {
			throw new Error('User must be authenticated');
		}

		const currentLog = await createDailyLog();

		if (!currentLog?.data) {
			throw new Error('There was a problem getting the most recent log');
		}

		// filter out the id entry passed
		const updatedFoodItems = currentLog.data.foodItems.filter(
			(item) => item.id !== foodEntryId
		);

		// update the log
		const update = await prisma.log.update({
			where: {
				id: currentLog.data.id
			},
			data: {
				foodItems: updatedFoodItems
			}
		});

		if (!update) {
			throw new Error('There was a problem updating the log');
		}

		return {
			success: true,
			message: 'Log updated successfully'
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

export async function updateFoodLogEntry(foodEntry: GetFoodEntry) {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session || !user) {
			throw new Error('User must be authenticated');
		}

		const currentLog = await createDailyLog();

		if (!currentLog?.data) {
			throw new Error('There was a problem getting the most recent log');
		}

		const { foodItems = [], id } = currentLog.data;

		// filter out the id entry passed
		const updatedFoodItem = foodItems
			.filter((item) => item.id === foodEntry.id)
			.map((item) => ({
				...item,
				description: foodEntry.description,
				image: foodEntry.image,
				numServings: foodEntry.numServings,
				calories: foodEntry.calories,
				carbGrams: foodEntry.carbGrams,
				proteinGrams: foodEntry.proteinGrams,
				fatGrams: foodEntry.fatGrams
			}));

		const updatedFoodItems = foodItems.filter(
			(item) => item.id !== foodEntry.id
		);

		updatedFoodItems.push(updatedFoodItem[0]);

		console.log('updatedFoodItems: ', updatedFoodItems);

		// update the log
		const update = await prisma.log.update({
			where: {
				id
			},
			data: {
				foodItems: updatedFoodItems
			}
		});

		if (!update) {
			throw new Error('There was a problem updating the log');
		}

		const theUpdate = update.foodItems.filter(
			(item) => item.id === foodEntry.id
		);

		revalidatePath('/');
		revalidatePath('/logs');

		return {
			success: true,
			message: 'Log updated successfully',
			data: theUpdate[0]
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}
