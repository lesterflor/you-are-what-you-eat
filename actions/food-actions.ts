'use server';

import { auth } from '@/db/auth';
import prisma from '@/db/prisma';
import { formatError } from '@/lib/utils';
import { foodItemSchema } from '@/lib/validators';
import { FoodItem, GetFoodItem, GetUser } from '@/types';
import { isEqual } from 'lodash';
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

export async function compareLocalFoods(localList: GetFoodItem[]) {
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
		const localStr = JSON.stringify(localList);

		const listsTheSame = dbStr === localStr;

		console.log(
			'are the lists the same? ',
			listsTheSame,
			' lodash: ',
			isEqual(dbFoods, localList),
			' local: ',
			localList.length,
			' fetched: ',
			dbFoods.length
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
			},
			include: {
				user: {
					select: {
						name: true,
						image: true
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
