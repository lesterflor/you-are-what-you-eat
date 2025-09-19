'use server';

import { auth } from '@/db/auth';
import prisma from '@/db/prisma';
import { formatError } from '@/lib/utils';
import { FoodEntry, GetPreparedDish, GetUser, PreparedDish } from '@/types';
import { getCurrentLog, updateLog } from './log-actions';

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
			message: `Successfully created dish, ${newDish.name}`,
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

		// clear all related images
		await prisma.preparedDishImage.deleteMany({
			where: {
				preparedDishId: existing.id
			}
		});

		const del = await prisma.preparedDish.delete({
			where: {
				id: existing.id
			}
		});

		return {
			success: true,
			message: `Successfull deleted dish, ${del.name}`,
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

		existing.preparedDishImages.sort(
			(a, b) => b.createdAt.getTime() - a.createdAt.getTime()
		);

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

export async function getDishImages(dishId: string) {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session || !user) {
			throw new Error('User must be authenticated');
		}

		const images = await prisma.preparedDishImage.findMany({
			where: {
				preparedDishId: dishId
			}
		});

		if (!images) {
			throw new Error('There was a problem finding images for the dish');
		}

		images.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

		return {
			success: true,
			message: 'success',
			data: images
		};
	} catch (err: unknown) {
		return {
			success: false,
			message: formatError(err)
		};
	}
}

export async function deleteDishImage(id: string) {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session || !user) {
			throw new Error('User must be authenticated');
		}

		const existing = await prisma.preparedDishImage.findFirst({
			where: {
				id
			}
		});

		if (!existing) {
			throw new Error('The dish could not be found');
		}

		const del = await prisma.preparedDishImage.delete({
			where: {
				id: existing.id
			}
		});

		return {
			success: true,
			message: 'Successfully deleted dish image',
			data: del
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

		dishes.forEach((dish) =>
			dish.preparedDishImages.sort(
				(a, b) => b.createdAt.getTime() - a.createdAt.getTime()
			)
		);

		return {
			success: true,
			message: 'success',
			data: dishes.map((item) => ({
				...item,
				description: item.description as string,
				foodItems: item.foodItems.map((fi) => ({
					...fi,
					description: fi.description as string,
					image: fi.image as string
				}))
			}))
		};
	} catch (err: unknown) {
		return {
			success: false,
			message: formatError(err)
		};
	}
}

export async function getAllDishesByUser() {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session || !user) {
			throw new Error('User must be authenticated');
		}

		const dishes = await prisma.preparedDish.findMany({
			where: {
				userId: user.id
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

		const getLatestLog = await getCurrentLog();

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
			message: `You logged items from the dish, ${dish.name}, successfully`,
			data: foodEntries,
			log: res.data,
			dish
		};
	} catch (err: unknown) {
		return {
			success: false,
			message: formatError(err)
		};
	}
}
