import { getFoodItems } from '@/actions/food-actions';
import {
	selectFoodUpdateData,
	selectFoodUpdateStatus
} from '@/lib/features/food/foodUpdateSlice';
import { useAppSelector } from '@/lib/hooks';
import { getStorageItem, setStorageItem } from '@/lib/utils';
import { GetFoodItem } from '@/types';
import { useEffect, useState } from 'react';

export const useFoodList = (list: GetFoodItem[] = []) => {
	const [foodList, setFoodList] = useState(list);
	const foodUpdateData = useAppSelector(selectFoodUpdateData);
	const foodUpdateStatus = useAppSelector(selectFoodUpdateStatus);

	useEffect(() => {
		if (foodUpdateStatus !== 'idle') {
			getFoods();
		}
	}, [foodUpdateData, foodUpdateStatus]);

	useEffect(() => {
		const localFoods: GetFoodItem[] = getStorageItem('foodList') || [];

		if (localFoods.length > 0) {
			setFoodList(localFoods);
			//validateLocalFoods(localFoods);
		} else {
			getFoods();
		}
	}, []);

	// const validateLocalFoods = async (localList: GetFoodItem[]) => {
	// 	const res = await compareLocalFoods(localList);

	// 	if (res.success && res.data) {
	// 		setStorageItem('foodList', res.data);
	// 		setFoodList(res.data as GetFoodItem[]);
	// 	}
	// };

	const getFoods = async () => {
		const res = await getFoodItems();

		if (res.success && res.data) {
			setFoodList(res.data as GetFoodItem[]);

			setStorageItem('foodList', res.data);
		}
	};

	return foodList;
};
