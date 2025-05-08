'use server';

import { auth } from '@/db/auth';
import prisma from '@/db/prisma';
import { formatError } from '@/lib/utils';
import { foodItemSchema } from '@/lib/validators';
import { FoodItem, GetFoodItem, GetUser } from '@/types';
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
						name: 'asc'
					}
			  })
			: await prisma.foodItem.findMany({
					orderBy: {
						name: 'asc'
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
					}
			  });

		if (!items) {
			throw new Error('There was a problem fetching food items');
		}

		// sort here again since some food items have been capitalized when added
		items.sort((a, b) => a.name.localeCompare(b.name));

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
			message: 'Food item added successfully',
			data: newItem
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
				name: item.name,
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
			message: 'Food item updated successfully',
			data: update
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
			message: 'Food item deleted successfully',
			data: del
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

export async function checkFoodItemBookmarked(foodItemId: string) {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session || !user) {
			throw new Error('User must be authenticated');
		}

		const existing = await prisma.foodItemFavourite.findFirst({
			where: {
				foodItemId,
				userId: user.id
			}
		});

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

export async function getFavouriteFoods() {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session || !user) {
			throw new Error('User must be authenticated');
		}

		const foods = await prisma.foodItemFavourite.findMany({
			where: {
				userId: user.id
			},
			include: {
				foodItem: {
					include: {
						user: true
					}
				}
			}
		});

		if (!foods) {
			throw new Error('There was a problem getting your favourites');
		}

		const foodItems = foods.map((item) => item.foodItem);

		return {
			success: true,
			message: 'success',
			data: foodItems
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

export async function bookmarkFoodItem(foodItemId: string) {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session || !user) {
			throw new Error('User must be authenticated');
		}

		const existing = await prisma.foodItem.findFirst({
			where: {
				id: foodItemId
			}
		});

		if (!existing) {
			throw new Error('Food item was not found');
		}

		// check if already marked
		const existingBookmark = await prisma.foodItemFavourite.findFirst({
			where: {
				userId: user.id,
				foodItemId: existing.id
			}
		});

		let bookmark;
		let added = false;

		if (existingBookmark) {
			bookmark = await prisma.foodItemFavourite.delete({
				where: {
					id: existingBookmark.id
				}
			});
			added = false;
			console.log(`deleted bookmark: ${bookmark}`);
		} else {
			bookmark = await prisma.foodItemFavourite.create({
				data: {
					userId: user.id,
					foodItemId
				}
			});
			console.log(`added bookmark: ${bookmark}`);
			added = true;
		}

		return {
			success: true,
			message: 'success',
			data: bookmark,
			bookmarked: added
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}
