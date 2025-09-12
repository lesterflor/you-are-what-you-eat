import { logDishItems } from '@/actions/prepared-dish-actions';
import { createAppSlice } from '@/lib/createAppSlice';
import { GetPreparedDish } from '@/types';
import type { PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'sonner';

export interface PreparedDishSliceProps {
	id: string;
	name: string;
	description: string;
	dishList: string;
	checkedItem?: string;
	failedItem?: string;
	log?: string;
}

export interface PreparedDishSliceState {
	value: PreparedDishSliceProps;
	status:
		| 'idle'
		| 'added'
		| 'deleted'
		| 'updated'
		| 'cleared'
		| 'logged'
		| 'logging'
		| 'failed'
		| 'checkedItem'
		| 'dishList';
	message: string;
}

const initialState: PreparedDishSliceState = {
	value: { id: '', name: '', description: '', dishList: '[]' },
	status: 'idle',
	message: ''
};

export const preparedDishSlice = createAppSlice({
	name: 'preparedDish',
	initialState,
	reducers: (create) => ({
		addDish: create.reducer(
			(state, action: PayloadAction<PreparedDishSliceProps>) => {
				state.value = action.payload;
				state.status = 'added';
				state.message = `You added a new dish, ${action.payload.name}`;
			}
		),
		updateDishState: create.reducer(
			(state, action: PayloadAction<PreparedDishSliceProps>) => {
				state.value = action.payload;
				state.status = 'updated';
				state.message = `You updated the dish, ${action.payload.name}`;
			}
		),
		deleteDishState: create.reducer(
			(state, action: PayloadAction<PreparedDishSliceProps>) => {
				state.value = action.payload;
				state.status = 'deleted';
				state.message = `You deleted the dish, ${action.payload.name}`;
			}
		),
		logDishState: create.reducer(
			(state, action: PayloadAction<PreparedDishSliceProps>) => {
				state.value = action.payload;
				state.status = 'logged';
				state.message = `You logged the dish, ${action.payload.name}`;
			}
		),

		logDishAsync: create.asyncThunk(
			async (dish: GetPreparedDish, { rejectWithValue }) => {
				const res = await logDishItems(dish);

				if (res.success) {
					return {
						dishItems: {
							...res.data?.map((item) => ({
								...item,
								eatenAt: item.eatenAt.toString()
							}))
						},
						message: res.message,
						log: {
							...res.log,
							createdAt: res.log && res.log.createdAt?.toString(),
							updatedAt: res.log && res.log.updatedAt?.toString(),
							user: {
								...res.log?.user,
								createdAt: res.log?.user.createdAt.toString(),
								updatedAt: res.log?.user.updatedAt.toString()
							},
							foodItems:
								res.log &&
								res.log.foodItems?.map((fi) => ({
									...fi,
									eatenAt: fi.eatenAt.toString()
								}))
						}
					};
				} else {
					return rejectWithValue(dish);
				}
			},
			{
				pending: (state) => {
					state.status = 'logging';
				},
				fulfilled: (state, action) => {
					state.status = 'logged';
					state.message = action.payload.message;
					state.value.log = JSON.stringify(action.payload.log);
					toast.success(action.payload.message);
				},
				rejected: (state, action) => {
					const failedDish = action.payload as GetPreparedDish;
					state.status = 'failed';
					state.value.failedItem = JSON.stringify(action.payload);
					state.message = `Failed to log dish, ${failedDish.name}`;
					toast.error(`Failed to log dish, ${failedDish.name}`);
				}
			}
		),

		setDishListState: create.reducer(
			(state, action: PayloadAction<PreparedDishSliceProps>) => {
				state.value = action.payload;
				state.status = 'dishList';
			}
		),

		setCheckedItemState: create.reducer(
			(state, action: PayloadAction<PreparedDishSliceProps>) => {
				const recItem = JSON.parse(action.payload.checkedItem!);
				const dishList = JSON.parse(state.value.dishList);
				const clone = [...dishList];

				let newData;

				if (recItem.add) {
					clone.push({ add: true, item: recItem.item });
					newData = clone;
				} else {
					newData = clone.filter(
						(lItem) =>
							recItem.item.id !== lItem.item.id ||
							recItem.item.eatenAt !== lItem.item.eatenAt
					);
				}

				state.value = { ...action.payload, dishList: JSON.stringify(newData) };
				state.status = 'checkedItem';
			}
		),
		clearItems: create.reducer((state) => {
			state.value = { id: '', name: '', description: '', dishList: '' };
			state.status = 'cleared';
		})
	}),
	selectors: {
		selectPreparedDishData: (state) => state.value,
		selectPreparedDishStatus: (state) => state.status,
		selectPreparedDishMsg: (state) => state.message
	}
});

export const {
	addDish,
	updateDishState,
	deleteDishState,
	clearItems,
	logDishState,
	logDishAsync,
	setDishListState,
	setCheckedItemState
} = preparedDishSlice.actions;

export const {
	selectPreparedDishData,
	selectPreparedDishStatus,
	selectPreparedDishMsg
} = preparedDishSlice.selectors;
