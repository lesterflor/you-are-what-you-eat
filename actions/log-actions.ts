'use server';

import { auth } from '@/db/auth';
import prisma from '@/db/prisma';
import {
	convertGlassesOfWater,
	formatError,
	getToday,
	totalMacrosReducer
} from '@/lib/utils';
import {
	FoodEntry,
	GetFoodEntry,
	GetUser,
	LogComparisonType,
	LogRemainderDataType
} from '@/types';
import { revalidatePath } from 'next/cache';
import { DateRange } from 'react-day-picker';

export async function getCurrentLog() {
	try {
		const session = await auth();
		const user = session?.user;

		if (!session || !user) {
			return;
		}

		const todaysLog = await prisma.log.findFirst({
			where: {
				//userId: '67db518ff10abb25395df978',
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

		if (!todaysLog) {
			throw new Error('There was a problem getting the log');
		}

		return {
			success: true,
			message: 'success',
			data: todaysLog
		};
	} catch (err: unknown) {
		return {
			success: false,
			message: formatError(err)
		};
	}
}

export async function createDailyLog(compareToYesterday: boolean = false) {
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
			logForToday = await prisma.log.create({
				data: {
					createdAt: new Date(getToday().current),
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
		} else {
			// sort the food items in the log latest to oldest
			todaysLog.foodItems.sort(
				(a, b) => b.eatenAt.getTime() - a.eatenAt.getTime()
			);

			logForToday = todaysLog;
		}

		if (
			logForToday.knownCaloriesBurned.length === 0 ||
			!logForToday.knownCaloriesBurned
		) {
			await createKnowDailyCalories(logForToday.id);
		}

		await createLogRemainder(logForToday.id);

		let comparisons: LogComparisonType = null;

		// compare log from yesterday (in header macros summary)
		if (compareToYesterday) {
			const yLog = await prisma.log.findFirst({
				where: {
					userId: user.id,
					createdAt: {
						gte: getToday().yesterday,
						lt: getToday().todayStart
					}
				},
				include: {
					user: {
						select: {
							BaseMetabolicRate: {
								select: {
									bmr: true
								}
							}
						}
					},
					knownCaloriesBurned: {
						select: {
							calories: true
						}
					},
					logRemainder: {
						select: {
							calories: true
						}
					}
				}
			});

			if (yLog) {
				const yfood = yLog.foodItems as GetFoodEntry[];
				const todaysFood = logForToday.foodItems as GetFoodEntry[];

				comparisons = {
					calories: {
						yesterday: totalMacrosReducer(yfood).calories,
						today: totalMacrosReducer(todaysFood).calories,
						belowYesterday:
							totalMacrosReducer(todaysFood).calories <
							totalMacrosReducer(yfood).calories
					},
					protein: {
						yesterday: totalMacrosReducer(yfood).protein,
						today: totalMacrosReducer(todaysFood).protein,
						belowYesterday:
							totalMacrosReducer(todaysFood).protein <
							totalMacrosReducer(yfood).protein
					},
					carbs: {
						yesterday: totalMacrosReducer(yfood).carbs,
						today: totalMacrosReducer(todaysFood).carbs,
						belowYesterday:
							totalMacrosReducer(todaysFood).carbs <
							totalMacrosReducer(yfood).carbs
					},
					fat: {
						yesterday: totalMacrosReducer(yfood).fat,
						today: totalMacrosReducer(todaysFood).fat,
						belowYesterday:
							totalMacrosReducer(todaysFood).fat < totalMacrosReducer(yfood).fat
					}
				};
			}
		}

		const totalCalories = Math.round(
			logForToday.foodItems.reduce((acc, curr) => {
				const sub = curr.calories * curr.numServings;
				return acc + sub;
			}, 0)
		);

		const remainingCalories =
			totalCalories -
			(logForToday.user.BaseMetabolicRate[0].bmr ||
				0 + logForToday.knownCaloriesBurned[0].calories ||
				0);

		const revisedLog = {
			...logForToday,
			comparisons,
			totalCalories,
			remainingCalories
		};

		return {
			success: true,
			message: 'success',
			data: revisedLog
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
				foodItems: foodEntries,
				updatedAt: new Date(getToday().current)
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

export async function getUserLogsInRange(from: Date, to: Date) {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session || !user) {
			throw new Error('User must be authenticated');
		}

		const logs = await prisma.log.findMany({
			where: {
				userId: user.id,
				createdAt: {
					gte: from,
					lte: to
				}
			},
			include: {
				knownCaloriesBurned: true,
				user: {
					select: {
						BaseMetabolicRate: true
					}
				}
			},
			orderBy: {
				createdAt: 'asc'
			}
		});

		return {
			success: true,
			message: 'success',
			data: logs
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

export async function getLogsByUserId(logId: string = '') {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!user) {
			throw new Error('User must be authenticated');
		}

		const logs = await prisma.log.findMany({
			where: {
				userId: user.id,
				//userId: '67db518ff10abb25395df978',
				id: logId ? logId : undefined,
				NOT: [
					{
						createdAt: {
							gte: getToday().todayStart,
							lt: getToday().todayEnd
						}
					}
				]
			},
			include: {
				knownCaloriesBurned: true,
				user: {
					select: {
						BaseMetabolicRate: true
					}
				}
			},
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

		let retData;

		const existing = await prisma.knownCaloriesBurned.findFirst({
			where: {
				logId,
				userId: user.id
			}
		});

		if (!existing) {
			const newKDC = await prisma.knownCaloriesBurned.create({
				data: {
					createdAt: new Date(getToday().current),
					logId,
					userId: user.id
				}
			});

			if (!newKDC) {
				throw new Error(
					'There was a problem creating the Known Calories Burned'
				);
			}

			retData = newKDC;
		} else {
			retData = existing;
		}

		return {
			success: true,
			message: 'success',
			data: retData
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

export async function createLogRemainder(logId: string) {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session || !user) {
			throw new Error('User must be authenticated');
		}

		let retVal;

		const existing = await prisma.logRemainder.findFirst({
			where: {
				logId,
				userId: user.id
			}
		});

		if (!existing) {
			const newRemainder = await prisma.logRemainder.create({
				data: {
					createdAt: new Date(getToday().current),
					logId,
					userId: user.id
				}
			});

			if (!newRemainder) {
				throw new Error('There was a problem creating the log remainder');
			}

			retVal = newRemainder;
		} else {
			retVal = existing;
		}

		return {
			success: true,
			message: 'success',
			data: retVal
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

// export async function addKnownCaloriesBurned(calories: number) {
// 	try {
// 		const session = await auth();
// 		const user = session?.user as GetUser;

// 		if (!session || !user) {
// 			throw new Error('User must be authenticated');
// 		}

// 		const currentLog = await createDailyLog();

// 		if (!currentLog?.data) {
// 			throw new Error('There was a problem getting the most recent log');
// 		}

// 		// technically there should only be 1 item for every log
// 		const { id, calories: existingCalories } =
// 			currentLog.data.knownCaloriesBurned[0];

// 		const update = await prisma.knownCaloriesBurned.update({
// 			where: {
// 				id
// 			},
// 			data: {
// 				calories: existingCalories + calories
// 			}
// 		});

// 		if (!update) {
// 			throw new Error('There was a problem updating the Known Calories Burned');
// 		}

// 		return {
// 			success: true,
// 			message: 'Updated Calories Burned'
// 		};
// 	} catch (error: unknown) {
// 		return {
// 			success: false,
// 			message: formatError(error)
// 		};
// 	}
// }

export async function addKnownCaloriesBurned(calories: number) {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session || !user) {
			throw new Error('User must be authenticated');
		}

		const existingKDC = await prisma.knownCaloriesBurned.findFirst({
			where: {
				userId: user.id,
				createdAt: {
					gte: getToday().todayStart,
					lt: getToday().todayEnd
				}
			}
		});

		if (!existingKDC) {
			throw new Error('There was a problem finding a log for today');
		}

		const update = await prisma.knownCaloriesBurned.update({
			where: {
				id: existingKDC.id
			},
			data: {
				calories: existingKDC.calories + calories,
				updatedAt: new Date(getToday().current)
			}
		});

		if (!update) {
			throw new Error('There was a problem updating the Known Calories Burned');
		}

		return {
			success: true,
			message: 'Updated Calories Burned',
			data: update
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

export async function getKnownCaloriesBurned(logId: string = '') {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session || !user) {
			throw new Error('User must be authenticated');
		}

		const existingKDC = logId
			? await prisma.knownCaloriesBurned.findFirst({
					where: {
						userId: user.id,
						logId
					}
			  })
			: await prisma.knownCaloriesBurned.findFirst({
					where: {
						userId: user.id,
						createdAt: {
							gte: getToday().todayStart,
							lt: getToday().todayEnd
						}
					}
			  });

		if (!existingKDC) {
			throw new Error('There was a problem finding a log for today');
		}

		return {
			success: true,
			message: 'success',
			data: existingKDC
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
				foodItems: updatedFoodItems,
				updatedAt: new Date(getToday().current)
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

		// update the log
		const update = await prisma.log.update({
			where: {
				id
			},
			data: {
				foodItems: updatedFoodItems,
				updatedAt: new Date(getToday().current)
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

export async function getLogRemainder() {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session || !user) {
			throw new Error('User must be authenticated');
		}

		const yesterdayLog = await prisma.log.findFirst({
			where: {
				userId: user.id,
				createdAt: {
					gte: getToday().yesterday,
					lt: getToday().todayStart
				}
			},
			include: {
				user: {
					select: {
						BaseMetabolicRate: {
							select: {
								bmr: true
							}
						}
					}
				},
				knownCaloriesBurned: {
					select: {
						calories: true
					}
				},
				logRemainder: {
					select: {
						calories: true
					}
				}
			}
		});

		if (!yesterdayLog) {
			throw new Error('There was a problem getting the most recent log');
		}

		const bmrCalories = yesterdayLog.user.BaseMetabolicRate[0].bmr ?? 0;
		const expendedCals = yesterdayLog.knownCaloriesBurned[0].calories ?? 0;
		const yesterdayConsumed = totalMacrosReducer(
			yesterdayLog.foodItems as GetFoodEntry[]
		).calories;
		const remainder = bmrCalories + expendedCals - yesterdayConsumed;

		const todaysLog = await createDailyLog();

		if (!todaysLog) {
			throw new Error('There was a problem getting todays log');
		}

		const todaysBMRCals = todaysLog.data?.user.BaseMetabolicRate[0].bmr ?? 0;
		const todaysExpendedCals =
			todaysLog.data?.knownCaloriesBurned[0].calories ?? 0;
		const todaysExpended = todaysBMRCals + todaysExpendedCals;

		const todaysFood = todaysLog.data?.foodItems ?? [];
		const todaysConsumed = totalMacrosReducer(
			todaysFood as GetFoodEntry[]
		).calories;

		const logRemainder = remainder + todaysExpended;
		const realRemainder = logRemainder - todaysConsumed;

		// get today's remainder record
		if (todaysLog.data?.id) {
			const todaysRemainder = await prisma.logRemainder.findFirst({
				where: {
					userId: user.id,
					logId: todaysLog.data.id
				}
			});

			if (todaysRemainder) {
				const update = await prisma.logRemainder.update({
					where: {
						id: todaysRemainder.id
					},
					data: {
						calories: realRemainder,
						updatedAt: new Date(getToday().current)
					}
				});

				if (!update) {
					throw new Error('There was a problem updating todays remainder');
				}

				const data: LogRemainderDataType = {
					remainder: update.calories,
					yesterdaysConsumed: yesterdayConsumed,
					yesterdaysExpended: expendedCals,
					bmr: bmrCalories,
					todaysConsumed,
					yesterdaysRemainder: remainder
				};

				return {
					success: true,
					message: 'success',
					data
				};
			}
		}

		return {
			success: true,
			message: 'success',
			data: null
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

export async function getCommonItemsInLog() {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session || !user) {
			throw new Error('User must be authenticated');
		}

		const logs = await prisma.log.findMany({
			where: {
				userId: user.id
			}
		});

		if (!logs) {
			throw new Error('There was a problem getting logs for user');
		}

		const items: any[] = [];

		logs.forEach((log) => {
			log.foodItems.forEach((food) => {
				items.push(food);
			});
		});

		items.sort((a, b) => a.name.localeCompare(b.name));

		return {
			success: true,
			message: 'success',
			data: items
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

export async function getLogRemainderByUserId() {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session || !user) {
			throw new Error('User must be authenticated');
		}

		const res = await prisma.logRemainder.findMany({
			where: {
				userId: user.id
			}
		});

		return {
			success: true,
			messaage: 'success',
			data: res
		};
	} catch (err: unknown) {
		return {
			success: false,
			message: formatError(err)
		};
	}
}

export async function getLogRemainderByUserIdInRange(range: DateRange) {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session || !user) {
			throw new Error('User must be authenticated');
		}

		const res = await prisma.log.findMany({
			where: {
				userId: user.id,
				createdAt: {
					gte: range.from,
					lte: range.to
				}
			},
			include: {
				knownCaloriesBurned: true,
				user: {
					select: {
						BaseMetabolicRate: true
					}
				}
			}
		});

		return {
			success: true,
			messaage: 'success',
			data: res
		};
	} catch (err: unknown) {
		return {
			success: false,
			message: formatError(err)
		};
	}
}

export async function todaysWaterConsumed(glasses: number = 0) {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session || !user) {
			throw new Error('User must be authenticated');
		}

		let retLog;

		const existingWaterLog = await prisma.waterConsumed.findFirst({
			where: {
				userId: user.id,
				createdAt: {
					gte: getToday().todayStart,
					lt: getToday().todayEnd
				}
			}
		});

		if (!existingWaterLog) {
			const newLog = await prisma.waterConsumed.create({
				data: {
					createdAt: new Date(getToday().current),
					userId: user.id,
					glasses,
					ounces: convertGlassesOfWater(glasses).ounces,
					litres: convertGlassesOfWater(glasses).litres
				}
			});

			if (!newLog) {
				throw new Error('There was a problem creating a new water log');
			}

			retLog = newLog;
		} else {
			const { glasses: exGlasses, ounces, litres } = existingWaterLog;

			const update = await prisma.waterConsumed.update({
				where: {
					id: existingWaterLog.id
				},
				data: {
					glasses: exGlasses + glasses,
					ounces: ounces + convertGlassesOfWater(glasses).ounces,
					litres: litres + convertGlassesOfWater(glasses).litres,
					updatedAt: new Date(getToday().current)
				}
			});

			if (!update) {
				throw new Error('There was a problem updating the water log for today');
			}

			retLog = update;
		}

		//console.log(retLog);

		return {
			success: true,
			message: 'Successfully updated water consumption',
			data: retLog
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}
