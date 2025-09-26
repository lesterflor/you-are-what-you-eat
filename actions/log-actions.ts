'use server';

import { auth } from '@/db/auth';
import prisma from '@/db/prisma';
import {
	calculateWaterIntake,
	colateBMRData,
	convertGlassesOfWater,
	formatError,
	formatUnit,
	generateMacroComparisons,
	getToday,
	totalMacrosReducer
} from '@/lib/utils';
import {
	BMRData,
	FoodEntry,
	GetFoodEntry,
	GetUser,
	LogComparisonType,
	LogRemainderDataType
} from '@/types';
import { revalidatePath } from 'next/cache';
import { DateRange } from 'react-day-picker';

export async function getCurrentLog(compareToYesterday: boolean = false) {
	try {
		const session = await auth();
		const user = session?.user;

		if (!session || !user) {
			return;
		}

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

		if (!todaysLog) {
			throw new Error('There was a problem getting the log');
		}

		todaysLog.foodItems.sort(
			(a, b) => b.eatenAt.getTime() - a.eatenAt.getTime()
		);

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
				comparisons = generateMacroComparisons(
					todaysLog.foodItems as GetFoodEntry[],
					yLog.foodItems as GetFoodEntry[]
				);
			}
		}

		const totalCalories = Math.round(
			todaysLog.foodItems.reduce((acc, curr) => {
				const sub = curr.calories * curr.numServings;
				return acc + sub;
			}, 0)
		);

		const remainingCalories =
			totalCalories -
			(todaysLog.user.BaseMetabolicRate[0].bmr ||
				0 + todaysLog.knownCaloriesBurned[0].calories ||
				0);

		const revisedLog = {
			...todaysLog,
			comparisons,
			totalCalories,
			remainingCalories
		};

		return {
			success: true,
			message: 'success',
			data: revisedLog
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
						BaseMetabolicRate: {
							select: {
								bmr: true,
								weightUnit: true,
								heightUnit: true,
								weight: true,
								height: true,
								age: true,
								sex: true
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
							BaseMetabolicRate: {
								select: {
									bmr: true,
									weightUnit: true,
									heightUnit: true,
									weight: true,
									height: true,
									age: true,
									sex: true
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
		} else {
			// sort the food items in the log latest to oldest
			todaysLog.foodItems.sort(
				(a, b) => b.eatenAt.getTime() - a.eatenAt.getTime()
			);

			logForToday = todaysLog;
		}

		if (logForToday.knownCaloriesBurned.length === 0) {
			// get todays kcb and attach it to the logForTday
			const kcb = await createKnowDailyCalories(logForToday.id);

			if (kcb.success && kcb.data) {
				logForToday.knownCaloriesBurned = [kcb.data];
			}
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
				comparisons = generateMacroComparisons(
					logForToday.foodItems as GetFoodEntry[],
					yLog.foodItems as GetFoodEntry[]
				);
			}
		}

		const { calories: totalCalories } = totalMacrosReducer(
			[...logForToday.foodItems].map((item) => ({
				...item,
				image: item.image ?? '',
				description: item.description ?? ''
			}))
		);

		const bmrVal = logForToday.user.BaseMetabolicRate[0].bmr ?? 0;
		const burnedVal = logForToday.knownCaloriesBurned[0].calories ?? 0;

		const remainingCalories = totalCalories - (bmrVal + burnedVal);

		// TODO - add all macros to the return object
		const foodItems = logForToday.foodItems.map((item) => ({
			...item,
			description: item.description as string,
			image: item.image as string
		}));

		const { calories, carbs, fat, protein } = totalMacrosReducer(foodItems);
		const macros = {
			bmr: logForToday.user.BaseMetabolicRate[0].bmr,
			caloriesBurned: logForToday.knownCaloriesBurned[0].calories ?? 0,
			caloriesRemaining: remainingCalories,
			caloriesRemainingCumulative:
				logForToday.logRemainder && logForToday.logRemainder.length > 0
					? logForToday.logRemainder[0]?.calories
					: 0,
			caloriesConsumed: calories,
			totalCarbs: carbs,
			totalFat: fat,
			totalProtein: protein
		};

		const bmrData = colateBMRData(
			logForToday.user.BaseMetabolicRate[0] as BMRData
		);
		const waterData = calculateWaterIntake(bmrData.weightInPounds ?? 0);

		const revisedLog = {
			...logForToday,
			comparisons,
			totalCalories,
			remainingCalories,
			macros,
			bmrData,
			waterData
		};

		console.log(revisedLog);

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
			},
			include: {
				user: {
					include: {
						BaseMetabolicRate: {
							select: {
								bmr: true,
								weightUnit: true,
								heightUnit: true,
								weight: true,
								height: true,
								age: true,
								sex: true
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

		if (!update) {
			throw new Error('There was a problem updating the log');
		}

		revalidatePath('/');

		return {
			success: true,
			message: 'success',
			data: update
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

export async function updateLogWithOrder(foodEntries: FoodEntry[]) {
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

		const currentFoodItems = logUpdate?.foodItems || [];

		const cleanArr = currentFoodItems.map((item) => ({
			...item,
			description: item.description || '',
			image: item.image || ''
		}));

		const foodItems = [...cleanArr];

		const listUpdates = foodItems.concat(foodEntries);

		const update = await prisma.log.update({
			where: {
				id: logUpdate?.id
			},
			data: {
				foodItems: listUpdates,
				updatedAt: new Date(getToday().current)
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

		if (!update) {
			throw new Error('There was a problem updating the log');
		}

		// sort by latest consumption
		const clone = { ...update };
		clone.foodItems.sort((a, b) => a.eatenAt.getTime() - b.eatenAt.getTime());

		//revalidatePath('/');

		const newItem = foodEntries[0];

		return {
			success: true,
			message: `You logged ${newItem.numServings} ${
				newItem.numServings === 1 ? 'serving' : 'servings'
			} of ${newItem.name}`,
			data: clone
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

		console.log(
			`Fetched logs for user: ${JSON.stringify(user)} - logs: ${logs.length}`
		);

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

export async function getKCBByDate(date: Date) {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session || !user) {
			throw new Error('User must be authenticated');
		}

		const endOfDay = new Date(date.getDate() + 1);

		const log = await prisma.knownCaloriesBurned.findFirst({
			where: {
				createdAt: {
					gte: date,
					lt: endOfDay
				}
			}
		});

		return {
			success: true,
			message: 'success',
			data: log
		};
	} catch (err: unknown) {
		return {
			success: false,
			message: formatError(err)
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

		const existingToday = await prisma.knownCaloriesBurned.findFirst({
			where: {
				createdAt: {
					gte: new Date(getToday().todayStart),
					lte: new Date(getToday().todayEnd)
				},
				userId: user.id
			}
		});

		//console.log(`with log: ${existing} - no log: ${existingToday}`);

		if (!existing && !existingToday) {
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
			if (!existing && existingToday) {
				// if there is no existing with logId, ensure the one found with a date is attached the logId passed in the method
				const updateLogId = await prisma.knownCaloriesBurned.update({
					where: {
						id: existingToday.id
					},
					data: {
						logId
					}
				});

				if (!updateLogId) {
					throw new Error('There was a problem updating the logId on KCB');
				}

				retData = existingToday;
			} else {
				retData = existing;
			}
		}

		//console.log(retData);

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

		const existingToday = await prisma.logRemainder.findFirst({
			where: {
				createdAt: {
					gte: new Date(getToday().todayStart),
					lte: new Date(getToday().todayEnd)
				},
				userId: user.id
			}
		});

		if (!existing || !existingToday) {
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
			if (!existing && existingToday) {
				const updateLogId = await prisma.logRemainder.update({
					where: {
						id: existingToday.id
					},
					data: {
						logId
					}
				});

				if (!updateLogId) {
					throw new Error('There was a problem attaching logId to remainder');
				}

				retVal = existingToday;
			} else {
				retVal = existing;
			}
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
			message: `Updated ${calories} calories to your total calories burned`,
			data: update,
			log: {} // remove for now
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

		const currentLog = await getCurrentLog();

		if (!currentLog?.data) {
			throw new Error('There was a problem getting the most recent log');
		}

		// filter out the id entry passed
		const updatedFoodItems = currentLog.data.foodItems.filter(
			(item) => item.id !== foodEntryId
		);

		//get the item to be deleted from the list
		const toBeDeleted = currentLog.data.foodItems.filter(
			(item) => item.id === foodEntryId
		);

		// update the log
		const update = await prisma.log.update({
			where: {
				id: currentLog.data.id
			},
			data: {
				foodItems: updatedFoodItems,
				updatedAt: new Date(getToday().current)
			},
			include: {
				user: {
					select: {
						BaseMetabolicRate: {
							select: {
								bmr: true,
								weightUnit: true,
								heightUnit: true,
								weight: true,
								height: true,
								age: true,
								sex: true
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

		if (!update) {
			throw new Error('There was a problem updating the log');
		}

		revalidatePath('/');

		return {
			success: true,
			message: 'Log updated successfully',
			data: toBeDeleted[0],
			log: update
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

		const currentLog = await getCurrentLog();

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
			message: `You updated the serving of ${theUpdate[0].name} to ${theUpdate[0].numServings}`,
			data: theUpdate[0],
			log: update
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

		const todaysLog = await getCurrentLog();

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

		const clone = [...logs];
		clone.sort((a, b) => a.createdAt.getDate() - b.createdAt.getDate());

		return {
			success: true,
			message: 'success',
			data: items,
			firstLog: clone[0]
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
			message: 'success',
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
					glasses: formatUnit(exGlasses + glasses),
					ounces: formatUnit(ounces + convertGlassesOfWater(glasses).ounces),
					litres: formatUnit(litres + convertGlassesOfWater(glasses).litres),
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
			message: `You added ${glasses} ${
				glasses === 1 ? 'glass' : 'glasses'
			} to today's water consumption`,
			data: retLog
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

export async function getWaterConsumedOnDay(day: Date) {
	try {
		const waterDate = day;
		const endDate = new Date();
		endDate.setDate(waterDate.getDate() + 1);

		const waterLog = await prisma.waterConsumed.findFirst({
			where: {
				createdAt: {
					gte: waterDate,
					lte: endDate
				}
			}
		});

		if (!waterLog) {
			throw new Error('There was no water log found for this date');
		}

		return {
			success: true,
			message: 'success',
			data: waterLog
		};
	} catch (err: unknown) {
		return {
			success: false,
			message: formatError(err)
		};
	}
}

export async function getAllUserWaterConsumption() {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!user) {
			throw new Error('User must be authenticated');
		}

		const res = await prisma.waterConsumed.findMany({
			where: {
				userId: user.id
			}
		});

		if (!res) {
			throw new Error('No water logs found for user');
		}

		return {
			success: true,
			message: 'success',
			data: res
		};
	} catch (err: unknown) {
		return {
			success: false,
			message: formatError(err)
		};
	}
}
