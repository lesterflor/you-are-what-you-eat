'use server';

import { auth } from '@/db/auth';
import prisma from '@/db/prisma';
import { formatError } from '@/lib/utils';
import {
	FoodItemImage,
	GetFoodItem,
	GetPreparedDish,
	GetUser,
	PreparedDishImage
} from '@/types';
import axios from 'axios';

type ResponseObjectType = {
	data: {
		success: boolean;
		data: string;
		message: string;
	};
};

export async function uploadDishImage(
	formData: FormData,
	dish: GetPreparedDish
) {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session || !user) {
			throw new Error('User must be authenticated');
		}

		const {
			data: { data, success, message }
		} = (await axios.post(
			'http://lesterflor.com/experiments/imageUploadAPI.php',
			formData
		)) as ResponseObjectType;

		if (success) {
			const img: PreparedDishImage = {
				url: data,
				alt: dish.name,
				preparedDishId: dish.id
			};

			const res = await uploadDishPhoto(img);

			if (res.success && res.data) {
				return {
					success: true,
					message: res.message,
					data: res.data
				};
			}
		}

		return {
			success,
			message,
			data
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

export async function uploadFoodItemImage(
	formData: FormData,
	item: GetFoodItem
) {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session || !user) {
			throw new Error('User must be authenticated');
		}

		const {
			data: { data, success, message }
		} = (await axios.post(
			'http://lesterflor.com/experiments/imageUploadAPI.php',
			formData
		)) as ResponseObjectType;

		if (success) {
			const img: FoodItemImage = {
				url: data,
				alt: item.name,
				foodItemId: item.id
			};

			const res = await uploadFoodItemPhoto(img);

			if (res.success && res.data) {
				return {
					success: true,
					message: res.message,
					data: res.data
				};
			}
		}

		return {
			success,
			message,
			data
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

export async function uploadDishPhoto(dishImage: PreparedDishImage) {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session || !user) {
			throw new Error('User must be authenticated');
		}

		const newImage = await prisma.preparedDishImage.create({
			data: dishImage
		});

		if (!newImage) {
			throw new Error('There was a problem adding the image');
		}

		return {
			success: true,
			message: 'Added image to your dish successfully',
			data: newImage
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error),
			data: ''
		};
	}
}

export async function uploadFoodItemPhoto(foodImage: FoodItemImage) {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session || !user) {
			throw new Error('User must be authenticated');
		}

		const newImage = await prisma.foodItemImage.create({
			data: foodImage
		});

		if (!newImage) {
			throw new Error('There was a problem adding the image');
		}

		return {
			success: true,
			message: 'Added image to food item successfully',
			data: newImage
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error),
			data: ''
		};
	}
}
