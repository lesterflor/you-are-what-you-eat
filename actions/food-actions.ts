'use server';

import { auth } from '@/db/auth';
import prisma from '@/db/prisma';
import { formatError } from '@/lib/utils';
import { foodItemSchema } from '@/lib/validators';
import { FoodItem, GetFoodItem } from '@/types';
import { revalidatePath } from 'next/cache';

export async function getFoodItems(
	name: string = '',
	category = '',
	user = ''
) {
	try {
		const noFields = !name && !category && !user;

		const items = !noFields
			? await prisma.foodItem.findMany({
					where: {
						name: {
							contains: name ? name : undefined,
							mode: 'insensitive'
						},
						category: category ? category : undefined,
						userId: user ? user : undefined
					},
					include: {
						user: {
							select: {
								id: true,
								name: true,
								image: true,
								FoodItems: true
							}
						}
					},
					orderBy: {
						createdAt: 'desc'
					}
			  })
			: await prisma.foodItem.findMany();

		if (!items) {
			throw new Error('There was a problem fetching food items');
		}

		return {
			success: true,
			message: 'success',
			data: items
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error),
			data: null
		};
	}
}

export async function addFoodItem(item: FoodItem) {
	try {
		const validated = foodItemSchema.parse(item);

		const newItem = await prisma.foodItem.create({
			data: validated
		});

		if (!newItem) {
			throw new Error('There was a problem creating a new food item');
		}

		revalidatePath('/foods');

		return {
			success: true,
			message: 'Food item added successfully'
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

export async function updateFoodItem(item: GetFoodItem) {
	try {
		const session = await auth();

		if (!session) {
			throw new Error('User must be authenticated');
		}

		const existing = await prisma.foodItem.findFirst({
			where: {
				id: item.id
			}
		});

		if (!existing) {
			throw new Error('The food item was not found');
		}

		const update = await prisma.foodItem.update({
			where: {
				id: existing.id
			},
			data: {
				category: item.category,
				image: item.image,
				carbGrams: item.carbGrams,
				fatGrams: item.fatGrams,
				proteinGrams: item.proteinGrams,
				calories: item.calories,
				description: item.description,
				servingSize: item.servingSize,
				userId: item.userId
			}
		});

		if (!update) {
			throw new Error('There was a problem updating the food item');
		}

		revalidatePath('/foods');

		return {
			success: true,
			message: 'Food item updated successfully'
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

export async function deleteFoodItem(id: string) {
	try {
		const existing = await prisma.foodItem.findFirst({
			where: {
				id
			}
		});

		if (!existing) {
			throw new Error('The food item was not found');
		}

		const del = await prisma.foodItem.delete({
			where: {
				id: existing.id
			}
		});

		if (!del) {
			throw new Error('There was a problem deleting the food item');
		}

		return {
			success: true,
			message: 'Food item deleted successfully'
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

export async function getFoodItemById(id: string) {
	try {
		const existing = await prisma.foodItem.findFirst({
			where: {
				id
			}
		});

		if (!existing) {
			throw new Error('The food item was not found');
		}

		return {
			success: true,
			message: 'success',
			data: existing
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}
