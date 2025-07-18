import { createAppSlice } from '@/lib/createAppSlice';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface PreparedDishSliceProps {
	id: string;
	name: string;
	description: string;
	dishList: string;
	checkedItem?: string;
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
	setDishListState,
	setCheckedItemState
} = preparedDishSlice.actions;

export const {
	selectPreparedDishData,
	selectPreparedDishStatus,
	selectPreparedDishMsg
} = preparedDishSlice.selectors;
