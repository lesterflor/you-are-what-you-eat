'use server';

import { auth } from '@/db/auth';
import prisma from '@/db/prisma';
import { formatError } from '@/lib/utils';
import { foodItemSchema } from '@/lib/validators';
import { FoodItem, GetFoodItem, GetUser } from '@/types';
import { revalidatePath } from 'next/cache';

export async function getAllFoodItemsPaged(
	page: number = 0,
	lastCursor: string = ''
) {
	try {
		const takeAmt = 20;

		const res =
			page === 0
				? await prisma.foodItem.findMany({
						take: takeAmt,
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
				  })
				: await prisma.foodItem.findMany({
						take: takeAmt,
						skip: 1,
						cursor: {
							id: lastCursor
						},

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

		const lastFoodItem = res[takeAmt - 1];
		const cursor = lastFoodItem.id;

		// sort here again since some food items have been capitalized when added
		res.sort((a, b) => a.name.localeCompare(b.name));

		return {
			success: true,
			message: 'success',
			lastCursor: cursor,
			data: res
		};
	} catch (err: unknown) {
		return {
			success: false,
			message: formatError(err)
		};
	}
}

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
						},
						foodItemImages: true
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
						},
						foodItemImages: true
					}
			  });

		if (!items) {
			throw new Error('There was a problem fetching food items');
		}

		items.forEach((item) =>
			item.foodItemImages.sort(
				(a, b) => b.createdAt.getTime() - a.createdAt.getTime()
			)
		);

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

export async function compareLocalFoods(strLen: number) {
	try {
		const dbFoods = await prisma.foodItem.findMany({
			include: {
				user: {
					select: {
						id: true,
						name: true,
						image: true,
						FoodItems: true
					}
				},
				foodItemImages: true
			},
			orderBy: {
				name: 'asc'
			}
		});

		if (!dbFoods) {
			throw new Error('There was a problem getting food list');
		}

		dbFoods.forEach((item) =>
			item.foodItemImages.sort(
				(a, b) => b.createdAt.getTime() - a.createdAt.getTime()
			)
		);

		// sort here again since some food items have been capitalized when added
		dbFoods.sort((a, b) => a.name.localeCompare(b.name));

		const dbStr = JSON.stringify(dbFoods);

		const listsTheSame = dbStr.length === strLen;

		console.log(
			'are the lists the same? ',
			listsTheSame,
			' local: ',
			strLen,
			' fetched: ',
			dbStr.length
		);

		return {
			success: true,
			message: listsTheSame ? 'lists are the same' : 'lists are different',
			data: listsTheSame ? null : dbFoods
		};
	} catch (err: unknown) {
		return {
			success: false,
			message: formatError(err)
		};
	}
}

export async function addFoodItem(item: FoodItem) {
	const session = await auth();
	const user = session?.user;

	if (!session || !user) {
		throw new Error('User must be authenticated');
	}

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
			message: `Food item ${newItem.name}, was added successfully.`,
			data: newItem,
			pushMessage: `${user.name} added a new food item, ${
				newItem.name
			}. It has ${newItem.calories} ${
				newItem.calories === 1 ? 'calorie' : 'calories'
			}, with ${newItem.carbGrams} ${
				newItem.carbGrams === 1 ? 'gram' : 'grams'
			} of carbs, ${newItem.proteinGrams} ${
				newItem.proteinGrams === 1 ? 'gram' : 'grams'
			} of protein, and ${newItem.fatGrams} ${
				newItem.fatGrams === 1 ? 'gram' : 'grams'
			} of fat, based on ${newItem.servingSize} ${
				newItem.servingSize === 1 ? 'serving' : 'servings'
			}.`
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
		const user = session?.user;

		if (!session || !user) {
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
			message: `Food item ${update.name}, was updated successfully.`,
			data: update,
			pushMessage: `${user.name} updated the food item, ${
				update.name
			}. It now has ${update.calories} ${
				update.calories === 1 ? 'calorie' : 'calories'
			}, with ${update.carbGrams} ${
				update.carbGrams === 1 ? 'gram' : 'grams'
			} of carbs, ${update.proteinGrams} ${
				update.proteinGrams === 1 ? 'gram' : 'grams'
			} of protein, and ${update.fatGrams} ${
				update.fatGrams === 1 ? 'gram' : 'grams'
			} of fat, based on ${update.servingSize} ${
				update.servingSize === 1 ? 'serving' : 'servings'
			}.`
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

export async function deleteFoodItem(id: string) {
	const session = await auth();
	const user = session?.user;

	if (!session || !user) {
		throw new Error('User must be authenticated');
	}

	try {
		const existing = await prisma.foodItem.findFirst({
			where: {
				id
			}
		});

		if (!existing) {
			throw new Error('The food item was not found');
		}

		// clear the images associated with this item
		await prisma.foodItemImage.deleteMany({
			where: {
				foodItemId: existing.id
			}
		});

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
			message: `Food item ${del.name}, was deleted successfully.`,
			data: del,
			pushMessage: `${user.name} deleted the food item, ${del.name}.`
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
			},
			include: {
				user: {
					select: {
						name: true,
						image: true,
						id: true
					}
				},
				foodItemImages: true
			}
		});

		if (!existing) {
			throw new Error('The food item was not found');
		}

		existing.foodItemImages.sort(
			(a, b) => b.createdAt.getTime() - a.createdAt.getTime()
		);

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
						user: {
							select: {
								id: true,
								name: true,
								image: true,
								FoodItems: true
							}
						},
						foodItemImages: true
					}
				}
			},
			orderBy: {
				foodItem: {
					name: 'asc'
				}
			}
		});

		if (!foods) {
			throw new Error('There was a problem getting your favourites');
		}

		const foodItems = foods.map((item) => item.foodItem);

		foodItems.sort((a, b) => a.name.localeCompare(b.name));

		const clean = foodItems.map((item) => ({
			...item,
			image: item.image as string,
			description: item.description as string,
			servingSize: item.servingSize as number,
			userId: item.userId as string
		}));

		return {
			success: true,
			message: 'success',
			data: clean
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
		} else {
			bookmark = await prisma.foodItemFavourite.create({
				data: {
					userId: user.id,
					foodItemId
				}
			});
			added = true;
		}

		return {
			success: true,
			message: `${existing.name} ${
				added ? 'added to' : 'removed from'
			} favourites`,
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
