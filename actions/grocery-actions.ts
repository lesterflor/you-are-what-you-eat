'use server';

import { auth } from '@/db/auth';
import prisma from '@/db/prisma';
import { formatError } from '@/lib/utils';
import {
	GetGroceryItem,
	GetGroceryList,
	GetUser,
	GroceryItem,
	GroceryListStatus
} from '@/types';

export async function createGroceryList(
	items: GetGroceryItem[],
	sharedUsers: string[] = []
) {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session || !user) {
			throw new Error('User must be authenticated');
		}

		const status: GroceryListStatus = 'pending';

		const filteredUsers = sharedUsers.filter((us) => us !== '');
		filteredUsers.push(user.id);

		const newList = await prisma.groceryList.create({
			data: {
				userId: user.id,
				status,
				sharedUsers: filteredUsers
			},
			include: {
				groceryItems: true
			}
		});

		if (!newList) {
			throw new Error('There was a problem creating the new grocery list');
		}

		const updateItems = items.map((item) => ({
			...item,
			groceryListId: newList.id
		}));

		// update the newList with the grocery items passed
		updateItems.forEach(async (update) => {
			const updateItem = await prisma.groceryItem.update({
				where: {
					id: update.id
				},
				data: {
					groceryListId: newList.id
				}
			});

			if (!updateItem) {
				throw new Error('There was a problem updating the grocery item');
			}
		});

		return {
			success: true,
			message: 'Successfully created new grocery list',
			data: newList
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

export async function createGroceryItem(item: GroceryItem) {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session || !user) {
			throw new Error('User must be authenticated');
		}

		const newItem = await prisma.groceryItem.create({
			data: item
		});

		if (!newItem) {
			throw new Error('There was a problem creating the new grocery list');
		}

		return {
			success: true,
			message: 'Successfully added grocery item',
			data: newItem
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

export async function updateGroceryList(list: GetGroceryList) {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session || !user) {
			throw new Error('User must be authenticated');
		}

		const existingList = await prisma.groceryList.findFirst({
			where: {
				id: list.id
			}
		});

		if (!existingList) {
			throw new Error('The grocery list was not found');
		}

		const updateList = await prisma.groceryList.update({
			where: {
				id: existingList.id
			},
			data: {
				sharedUsers: list.sharedUsers,
				status: list.status
			},
			include: {
				groceryItems: true
			}
		});

		if (!updateList) {
			throw new Error('There was a problem updating the grocery list');
		}

		return {
			success: true,
			message: 'Successfully updated grocery list',
			data: updateList
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

export async function updateGroceryItem(item: GetGroceryItem) {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session || !user) {
			throw new Error('User must be authenticated');
		}

		const existingItem = await prisma.groceryItem.findFirst({
			where: {
				id: item.id
			}
		});

		if (!existingItem) {
			throw new Error('The grocery item was not found');
		}

		const updateItem = await prisma.groceryItem.update({
			where: {
				id: existingItem.id
			},
			data: {
				status: item.status,
				groceryListId: item.groceryListId,
				name: item.name,
				description: item.description,
				qty: item.qty
			}
		});

		if (!updateItem) {
			throw new Error('There was a problem updating the grocery item');
		}

		return {
			success: true,
			message: 'Successfully updated grocery item',
			data: updateItem
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

export async function deleteGroceryList(listId: string) {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session || !user) {
			throw new Error('User must be authenticated');
		}

		const existingList = await prisma.groceryList.findFirst({
			where: {
				id: listId
			}
		});

		if (!existingList) {
			throw new Error('The grocery list was not found');
		}

		const deleteList = await prisma.groceryList.delete({
			where: {
				id: existingList.id
			}
		});

		if (!deleteList) {
			throw new Error('There was a problem deleting the grocery list');
		}

		return {
			success: true,
			message: 'Successfully deleted grocery list'
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

export async function deleteGroceryItem(itemId: string) {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session || !user) {
			throw new Error('User must be authenticated');
		}

		const existingItem = await prisma.groceryItem.findFirst({
			where: {
				id: itemId
			}
		});

		if (!existingItem) {
			throw new Error('The grocery item was not found');
		}

		const deleteItem = await prisma.groceryItem.delete({
			where: {
				id: existingItem.id
			}
		});

		if (!deleteItem) {
			throw new Error('There was a problem deleting the grocery item');
		}

		return {
			success: true,
			message: 'Successfully deleted grocery item'
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

export async function getGroceryListById(listId: string) {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session || !user) {
			throw new Error('User must be authenticated');
		}

		const existingList = await prisma.groceryList.findFirst({
			where: {
				id: listId
			}
		});

		if (!existingList) {
			throw new Error('The grocery list was not found');
		}

		return {
			success: true,
			message: 'Successfully got grocery list',
			data: existingList
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

export async function getGroceryListsByUser(activeOnly = false) {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session || !user) {
			throw new Error('User must be authenticated');
		}

		const existingList = await prisma.groceryList.findMany({
			where: {
				status: activeOnly ? 'pending' : undefined,
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
			include: {
				groceryItems: true
			},
			orderBy: {
				createdAt: 'desc'
			}
		});

		if (!existingList) {
			throw new Error('The grocery list was not found');
		}

		return {
			success: true,
			message: 'Successfully got grocery list',
			data: existingList
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

export async function getGroceryItemById(itemId: string) {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session || !user) {
			throw new Error('User must be authenticated');
		}

		const existingItem = await prisma.groceryItem.findFirst({
			where: {
				id: itemId
			}
		});

		if (!existingItem) {
			throw new Error('The grocery item was not found');
		}

		return {
			success: true,
			message: 'Successfully got grocery item',
			data: existingItem
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}
