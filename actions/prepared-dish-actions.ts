'use server';

import { auth } from '@/db/auth';
import prisma from '@/db/prisma';
import { formatError } from '@/lib/utils';
import { FoodEntry, GetPreparedDish, GetUser, PreparedDish } from '@/types';
import { createDailyLog, updateLog } from './log-actions';

export async function createDish(dish: PreparedDish) {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session || !user) {
			throw new Error('User must be authenticated');
		}

		const newDish = await prisma.preparedDish.create({
			data: dish
		});

		if (!newDish) {
			throw new Error('There was a problem creating the dish');
		}

		return {
			success: true,
			message: 'Successfully created dish',
			data: newDish
		};
	} catch (err: unknown) {
		return {
			success: false,
			message: formatError(err)
		};
	}
}

export async function updateDish(dish: GetPreparedDish) {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session || !user) {
			throw new Error('User must be authenticated');
		}

		const existing = await prisma.preparedDish.findFirst({
			where: {
				id: dish.id
			}
		});

		if (!existing) {
			throw new Error('The dish could not be found');
		}

		const updateDish = await prisma.preparedDish.update({
			where: {
				id: existing.id
			},
			data: {
				foodItems: dish.foodItems,
				name: dish.name,
				description: dish.description,
				sharedUsers: dish.sharedUsers
			}
		});

		if (!updateDish) {
			throw new Error('There was a problem updating the dish');
		}

		return {
			success: true,
			message: 'Successfully updated dish',
			data: updateDish
		};
	} catch (err: unknown) {
		return {
			success: false,
			message: formatError(err)
		};
	}
}

export async function deleteDish(dishId: string) {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session || !user) {
			throw new Error('User must be authenticated');
		}

		const existing = await prisma.preparedDish.findFirst({
			where: {
				id: dishId
			}
		});

		if (!existing) {
			throw new Error('The dish could not be found');
		}

		const del = await prisma.preparedDish.delete({
			where: {
				id: existing.id
			}
		});

		return {
			success: true,
			message: 'Successfully deleted dish',
			data: del
		};
	} catch (err: unknown) {
		return {
			success: false,
			message: formatError(err)
		};
	}
}

export async function getDishById(dishId: string) {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session || !user) {
			throw new Error('User must be authenticated');
		}

		const existing = await prisma.preparedDish.findFirst({
			where: {
				id: dishId
			},
			include: {
				preparedDishImages: true
			}
		});

		if (!existing) {
			throw new Error('The dish could not be found');
		}

		return {
			success: true,
			message: 'success',
			data: existing
		};
	} catch (err: unknown) {
		return {
			success: false,
			message: formatError(err)
		};
	}
}

export async function getAllDishes() {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session || !user) {
			throw new Error('User must be authenticated');
		}

		const dishes = await prisma.preparedDish.findMany({
			where: {
				OR: [
					{
						userId: user.id
					},
					{
						sharedUsers: {
							hasSome: [user.id]
						}
					}
				]
			},
			orderBy: {
				updatedAt: 'desc'
			},
			include: {
				preparedDishImages: true
			}
		});

		if (!dishes) {
			throw new Error('There was a problem getting dishes');
		}

		return {
			success: true,
			message: 'success',
			data: dishes
		};
	} catch (err: unknown) {
		return {
			success: false,
			message: formatError(err)
		};
	}
}

export async function logDishItems(dish: GetPreparedDish) {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session || !user) {
			throw new Error('User must be authenticated');
		}

		const existing = await prisma.preparedDish.findFirst({
			where: {
				id: dish.id
			}
		});

		if (!existing) {
			throw new Error('The dish was not found');
		}

		const foodEntries: FoodEntry[] = dish.foodItems.map((item) => ({
			id: item.id,
			name: item.name,
			category: item.category,
			description: item.description ?? '',
			numServings: item.numServings,
			image: item.image || '',
			carbGrams: item.carbGrams,
			fatGrams: item.fatGrams,
			proteinGrams: item.proteinGrams,
			calories: item.calories,
			eatenAt: new Date()
		}));

		const getLatestLog = await createDailyLog();

		const currentFoodItems = getLatestLog?.data?.foodItems || [];

		const cleanArr = currentFoodItems.map((item) => ({
			...item,
			description: item.description || '',
			image: item.image || ''
		}));

		const foodItems = [...cleanArr];

		foodEntries.forEach((item) => {
			foodItems.push(item);
		});

		const res = await updateLog(foodItems);

		if (!res.success) {
			return {
				success: false,
				message: res.message
			};
		}

		return {
			success: true,
			message: 'Successfully added dish items to your log'
		};
	} catch (err: unknown) {
		return {
			success: false,
			message: formatError(err)
		};
	}
}
