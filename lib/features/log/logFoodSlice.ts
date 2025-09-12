import {
	addKnownCaloriesBurned,
	deleteFoodLogEntry,
	updateFoodLogEntry,
	updateLogWithOrder
} from '@/actions/log-actions';
import { logDishItems } from '@/actions/prepared-dish-actions';
import { createAppSlice } from '@/lib/createAppSlice';
import { serializeLog, totalMacrosReducer } from '@/lib/utils';
import { FoodEntry, GetLogEnhanced, GetPreparedDish } from '@/types';
import type { PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'sonner';

type SerializedFoodItems = {
	eatenAt: string;
	id: string;
	name: string;
	category: string;
	description: string | null;
	numServings: number;
	image: string | null;
	carbGrams: number;
	fatGrams: number;
	proteinGrams: number;
	calories: number;
}[];

export interface FoodItemsState {
	id: string;
	name: string;
	category: string;
	description?: string | null;
	numServings: number;
	image?: string | null;
	carbGrams: number;
	fatGrams: number;
	proteinGrams: number;
	calories: number;
	eatenAt: string;
}

export interface LogFoodSliceState {
	value: {
		name: string;
		servings: number;
		time: string;
		caloriesExpended: number;
		message: string;
		pendingItemId?: string;
	};
	log?: {
		id?: string;
		createdAt?: string | Date;
		updatedAt?: string | Date;
		userId?: string;
		foodItems?: FoodItemsState[];
	};

	currentDishItems?: FoodItemsState[];

	macros: {
		caloriesBurned?: number | undefined;
		caloriesConsumed?: number | undefined;
		caloriesRemaining?: number | undefined;
		caloriesRemainingCumulative?: number | undefined;
		bmr?: number | undefined;
		totalCarbs?: number | undefined;
		totalProtein?: number | undefined;
		totalFat?: number | undefined;
	};

	bmrData: {
		bmr: number | undefined;
		weightUnit: string | undefined;
		weight: number | undefined;
		heightUnit: string | undefined;
		height: number | undefined;
		age: number | undefined;
		sex: string | undefined;
	};

	currentLog?: string;

	deletedItem?: FoodItemsState;
	updatedItem?: FoodItemsState;
	status:
		| 'idle'
		| 'initial'
		| 'added'
		| 'updated'
		| 'updating'
		| 'deleted'
		| 'deleting'
		| 'expended calories'
		| 'loggingCalories'
		| 'loggedCalories'
		| 'loggingDish'
		| 'loggedDish'
		| 'adding'
		| 'failed';
}

const initialState: LogFoodSliceState = {
	value: {
		name: '',
		servings: 0,
		time: '',
		caloriesExpended: 0,
		message: '',
		pendingItemId: undefined
	},
	currentDishItems: [],
	macros: {
		caloriesBurned: undefined,
		caloriesConsumed: undefined,
		caloriesRemaining: undefined,
		caloriesRemainingCumulative: undefined,
		bmr: undefined,
		totalCarbs: undefined,
		totalProtein: undefined,
		totalFat: undefined
	},
	bmrData: {
		bmr: undefined,
		weightUnit: undefined,
		weight: undefined,
		heightUnit: undefined,
		height: undefined,
		age: undefined,
		sex: undefined
	},
	currentLog: '',
	log: undefined,
	deletedItem: undefined,
	updatedItem: undefined,
	status: 'idle'
};

// If you are not using async thunks you can use the standalone `createSlice`.
export const logFoodSlice = createAppSlice({
	name: 'logFood',
	// `createSlice` will infer the state type from the `initialState` argument
	initialState,
	// The `reducers` field lets us define reducers and generate associated actions
	reducers: (create) => ({
		added: create.reducer(
			(state, action: PayloadAction<{ name: string; servings: number }>) => {
				// Redux Toolkit allows us to write "mutating" logic in reducers. It
				// doesn't actually mutate the state because it uses the Immer library,
				// which detects changes to a "draft state" and produces a brand new
				// immutable state based off those changes
				//state.value += 1;
				const dateString = `${new Date().getTime()}`;
				state.value = {
					name: action.payload.name,
					servings: action.payload.servings,
					time: dateString,
					caloriesExpended: state.value.caloriesExpended,
					message: `You logged ${action.payload.servings} ${
						action.payload.servings === 1 ? 'serving' : 'servings'
					} of ${action.payload.name}`
				};
				state.status = 'added';
			}
		),

		updated: create.reducer(
			(state, action: PayloadAction<{ name: string; servings: number }>) => {
				const dateString = `${new Date().getTime()}`;
				state.value = {
					name: action.payload.name,
					servings: action.payload.servings,
					time: dateString,
					caloriesExpended: state.value.caloriesExpended,
					message: `You updated the serving of ${action.payload.name} to ${action.payload.servings}`
				};
				state.status = 'updated';
			}
		),

		deleted: create.reducer(
			(
				state,
				action: PayloadAction<{
					name: string;
					servings: number;
					id?: string;
				}>
			) => {
				const dateString = `${new Date().getTime()}`;
				state.value = {
					name: action.payload.name,
					servings: action.payload.servings,
					time: dateString,
					caloriesExpended: state.value.caloriesExpended,
					message: `You deleted your logged food item, ${action.payload.name}`
				};
				state.status = 'deleted';

				if (state.log) {
					state.log.foodItems = state.log.foodItems?.filter(
						(item) => item.id !== action.payload.id
					);
				}
			}
		),
		expendedCaloriesUpdated: create.reducer(
			(state, action: PayloadAction<number>) => {
				const dateString = `${new Date().getTime()}`;
				state.value = {
					name: state.value.name,
					servings: state.value.servings,
					time: dateString,
					caloriesExpended:
						(state.value.caloriesExpended ?? 0) + action.payload,
					message: `You added ${action.payload} ${
						action.payload === 1 ? 'calorie' : 'calories'
					} to your expended calories`
				};
				state.macros.caloriesBurned =
					(state.value.caloriesExpended ?? 0) + action.payload;
				state.status = 'expended calories';
			}
		),
		reset: create.reducer((state) => {
			state.value = {
				...state.value,
				name: '',
				servings: 0,
				time: '',
				caloriesExpended: 0,
				message: ''
			};
			state.status = 'idle';
		}),

		setCurrentLog: create.reducer((state, action: PayloadAction<string>) => {
			state.currentLog = action.payload;

			// must deserialize first to pass to totalMacrosReducer
			const logSer = JSON.parse(action.payload);

			const { totalCarbs, totalFat, totalProtein, caloriesConsumed } =
				deserFoodItemsMacros(logSer.foodItems);

			const {
				remainingCalories,
				logRemainder,
				knownCaloriesBurned,
				user: { BaseMetabolicRate: bmrArr }
			} = logSer;

			state.macros = {
				...state.macros,
				bmr: bmrArr[0].bmr,
				caloriesBurned: knownCaloriesBurned[0].calories,
				caloriesRemaining: remainingCalories,
				caloriesRemainingCumulative: logRemainder[0].calories,
				caloriesConsumed,
				totalCarbs,
				totalFat,
				totalProtein
			};

			const { bmr, weight, weightUnit, height, heightUnit, age, sex } =
				logSer.user.BaseMetabolicRate[0];

			state.bmrData = {
				bmr,
				weightUnit,
				weight,
				height,
				heightUnit,
				age,
				sex
			};

			state.status = 'initial';
		}),

		// The function below is called a thunk and allows us to perform async logic. It
		// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
		// will call the thunk with the `dispatch` function as the first argument. Async
		// code can then be executed and other actions can be dispatched. Thunks are
		// typically used to make async requests.
		deleteLogItemAsync: create.asyncThunk(
			async (id: string, { rejectWithValue }) => {
				const res = await deleteFoodLogEntry(id);

				if (res.data && res.success) {
					return {
						...res.data,
						eatenAt: res.data.eatenAt.toString(),
						log: {
							...res.log,
							createdAt: res.log.createdAt.toString(),
							updatedAt: res.log.updatedAt.toString(),
							foodItems:
								res.log &&
								res.log.foodItems?.map((fi) => ({
									...fi,
									eatenAt: fi.eatenAt.toString()
								}))
						},
						message: res.message
					};
				}

				return rejectWithValue({ pendingId: id, error: res.message as string });
			},
			{
				pending: (state) => {
					state.status = 'deleting';
				},
				fulfilled: (state, action) => {
					state.status = 'deleted';

					if (action.payload) {
						state.deletedItem = action.payload;
					}

					if (action.payload && action.payload.log?.foodItems) {
						const dateString = `${new Date().getTime()}`;

						const { totalCarbs, totalFat, totalProtein, caloriesConsumed } =
							deserFoodItemsMacros(action.payload.log.foodItems);

						state.value = {
							name: action.payload.name,
							servings: action.payload.numServings,
							time: dateString,
							caloriesExpended: state.value.caloriesExpended,
							message: `You deleted your logged food item, ${action.payload.name}`
						};

						toast.success(
							`You deleted your logged food item, ${action.payload.name}`
						);

						state.log = {
							...state.log,
							foodItems: action.payload.log.foodItems?.filter(
								(item) => item.id !== action.payload?.id
							)
						};

						const serLog = {
							...action.payload.log
						};

						state.log = serLog;
						state.currentLog = JSON.stringify(serLog);

						state.macros.totalCarbs = totalCarbs;
						state.macros.totalFat = totalFat;
						state.macros.totalProtein = totalProtein;
						state.macros.caloriesBurned =
							action.payload.log.knownCaloriesBurned[0]?.calories ?? 0;
						state.macros.caloriesConsumed = caloriesConsumed;
						state.macros.caloriesRemaining =
							caloriesConsumed -
							(action.payload.log.knownCaloriesBurned[0].calories +
								action.payload.log.user.BaseMetabolicRate[0].bmr);
						state.macros.bmr = action.payload.log.user.BaseMetabolicRate[0].bmr;
					}
				},
				rejected: (state, action) => {
					const errMsg = (
						action.payload as { pendingId: string; error: string }
					).error;
					state.status = 'failed';
					state.value = {
						...state.value,
						pendingItemId: (action.payload as { pendingId: string })?.pendingId,
						message: errMsg
					};
					toast.error(errMsg);
				}
			}
		),

		logPrepDishAsync: create.asyncThunk(
			async (dish: GetPreparedDish, { rejectWithValue }) => {
				const res = await logDishItems(dish);

				if (res.success) {
					return {
						dishItems: res.data?.map((item) => ({
							...item,
							eatenAt: item.eatenAt.toString()
						})),
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
					state.status = 'loggingDish';
				},
				fulfilled: (state, action) => {
					state.status = 'loggedDish';
					state.value.message = action.payload.message;
					state.currentLog = JSON.stringify(action.payload.log);

					state.currentDishItems = action.payload.dishItems;

					const serLog = {
						...action.payload.log
					};

					state.log = serLog;

					if (serLog.foodItems) {
						const { totalCarbs, totalFat, totalProtein, caloriesConsumed } =
							deserFoodItemsMacros(serLog.foodItems);

						state.macros.totalCarbs = totalCarbs;
						state.macros.totalFat = totalFat;
						state.macros.totalProtein = totalProtein;

						if (
							action.payload.log.knownCaloriesBurned &&
							action.payload.log.user.BaseMetabolicRate
						) {
							state.macros = {
								...state.macros,
								caloriesBurned:
									action.payload.log.knownCaloriesBurned[0]?.calories ?? 0,
								caloriesConsumed,
								caloriesRemaining:
									caloriesConsumed -
									(action.payload.log.knownCaloriesBurned[0].calories +
										action.payload.log.user.BaseMetabolicRate[0].bmr),
								bmr: action.payload.log.user.BaseMetabolicRate[0].bmr
							};
						}
					}

					toast.success(action.payload.message);
				},
				rejected: (state, action) => {
					const failedDish = action.payload as GetPreparedDish;
					state.status = 'failed';
					state.value.message = `Failed to log dish, ${failedDish.name}`;
					toast.error(`Failed to log dish, ${failedDish.name}`);
				}
			}
		),

		logFoodAsync: create.asyncThunk(
			async (
				{
					logFoodItem,
					name,
					servings
				}: {
					logFoodItem: FoodEntry;
					name: string;
					servings: number;
				},
				{ rejectWithValue }
			) => {
				const res = await updateLogWithOrder([logFoodItem]);
				// The value we return becomes the `fulfilled` action payload

				if (res.data) {
					return {
						log: {
							...res.data,
							createdAt: res.data && res.data.createdAt?.toString(),
							updatedAt: res.data && res.data.updatedAt?.toString(),
							foodItems:
								res.data &&
								res.data.foodItems?.map((fi) => ({
									...fi,
									eatenAt: fi.eatenAt.toString()
								}))
						},
						name,
						servings,
						message: res.message
					};
				}

				return rejectWithValue({ error: res.message });
			},
			{
				pending: (state) => {
					state.status = 'adding';
				},
				fulfilled: (state, action) => {
					state.status = 'added';

					if (action.payload) {
						const successMsg = `You logged ${action.payload.servings} ${
							action.payload.servings === 1 ? 'serving' : 'servings'
						} of ${action.payload.name}`;

						toast.success(successMsg);

						const dateString = `${new Date().getTime()}`;

						const { totalCarbs, totalFat, totalProtein, caloriesConsumed } =
							deserFoodItemsMacros(action.payload.log.foodItems);

						state.value = {
							name: action.payload.name,
							servings: action.payload.servings,
							time: dateString,
							caloriesExpended: state.value.caloriesExpended,
							message: successMsg
						};

						const serLog = {
							...action.payload.log
						};

						state.log = serLog;
						state.currentLog = JSON.stringify(serLog);

						state.macros.totalCarbs = totalCarbs;
						state.macros.totalFat = totalFat;
						state.macros.totalProtein = totalProtein;
						state.macros.caloriesBurned =
							action.payload.log.knownCaloriesBurned[0]?.calories ?? 0;
						state.macros.caloriesConsumed = caloriesConsumed;
						state.macros.caloriesRemaining =
							caloriesConsumed -
							(action.payload.log.knownCaloriesBurned[0].calories +
								action.payload.log.user.BaseMetabolicRate[0].bmr);
						state.macros.bmr = action.payload.log.user.BaseMetabolicRate[0].bmr;
					}
				},
				rejected: (state, action) => {
					const errMsg = (action.payload as { error: string })?.error;
					state.status = 'failed';
					state.value = {
						...state.value,
						message: errMsg
					};

					toast.error(errMsg);
				}
			}
		),

		logCaloriesBurnedAsync: create.asyncThunk(
			async (cals: number, { rejectWithValue }) => {
				// action to add new known calories burned
				const res = await addKnownCaloriesBurned(cals);

				if (res.success) {
					return {
						calories: res.data?.calories ?? 0,
						log: serializeLog(res.log as GetLogEnhanced),
						message: res.message
					};
				}

				return rejectWithValue(res.message);
			},
			{
				pending: (state) => {
					state.status = 'loggingCalories';
				},
				fulfilled: (state, action) => {
					state.status = 'loggedCalories';

					if (action.payload?.log) {
						const { totalCarbs, totalFat, totalProtein, caloriesConsumed } =
							deserFoodItemsMacros(action.payload.log.foodItems);

						state.macros.totalCarbs = totalCarbs;
						state.macros.totalFat = totalFat;
						state.macros.totalProtein = totalProtein;
						state.macros.caloriesBurned =
							action.payload.log.knownCaloriesBurned[0]?.calories ?? 0;
						state.macros.caloriesConsumed = caloriesConsumed;
						state.macros.caloriesRemaining =
							caloriesConsumed -
							(action.payload.log.knownCaloriesBurned[0].calories +
								action.payload.log.user.BaseMetabolicRate[0].bmr);
						state.macros.bmr = action.payload.log.user.BaseMetabolicRate[0].bmr;

						toast.success(action.payload.message);
					}
				},
				rejected: (state, action) => {
					state.status = 'failed';
					state.value.message = action.payload as string;
					toast.error(action.payload as string);
				}
			}
		),

		updateItemAsync: create.asyncThunk(
			async (entry: FoodEntry, { rejectWithValue }) => {
				const res = await updateFoodLogEntry(entry);

				if (res.success && res.data) {
					return {
						data: { ...res.data, eatenAt: res.data?.eatenAt.toString() },
						log: serializeLog(res.log)
					};
				}

				return rejectWithValue({
					pendingId: entry.id,
					error: res.message
				});
			},
			{
				pending: (state) => {
					state.status = 'updating';
				},
				fulfilled: (state, action) => {
					state.status = 'updated';

					if (action.payload.data) {
						const dateString = `${new Date().getTime()}`;

						const { totalCarbs, totalFat, totalProtein, caloriesConsumed } =
							deserFoodItemsMacros(action.payload.log.foodItems);

						const successMsg = `You updated the serving of ${action.payload.data.name} to ${action.payload.data.numServings}`;

						state.value = {
							name: action.payload.data.name as string,
							servings: action.payload.data.numServings as number,
							time: dateString,
							caloriesExpended: state.value.caloriesExpended,
							message: successMsg
						};

						toast.success(successMsg);

						state.macros.totalCarbs = totalCarbs;
						state.macros.totalFat = totalFat;
						state.macros.totalProtein = totalProtein;
						state.macros.caloriesBurned =
							action.payload.log.knownCaloriesBurned[0]?.calories ?? 0;
						state.macros.caloriesConsumed = caloriesConsumed;
						state.macros.caloriesRemaining =
							caloriesConsumed -
							(action.payload.log.knownCaloriesBurned[0].calories +
								action.payload.log.user.BaseMetabolicRate[0].bmr);
						state.macros.bmr = action.payload.log.user.BaseMetabolicRate[0].bmr;

						state.updatedItem = {
							...action.payload.data,
							id: action.payload.data.id as string,
							name: action.payload.data.name as string,
							category: action.payload.data.category as string,
							description: action.payload.data.description as string,
							numServings: action.payload.data.numServings as number,
							image: action.payload.data.image as string,
							carbGrams: action.payload.data.carbGrams as number,
							fatGrams: action.payload.data.fatGrams as number,
							proteinGrams: action.payload.data.proteinGrams as number,
							calories: action.payload.data.calories as number,
							eatenAt: action.payload.data.eatenAt as string
						};
						state.log = action.payload.log;
					}
				},
				rejected: (state, action) => {
					state.status = 'failed';

					const errMsg = (
						action.payload as { pendingId: string; error: string }
					)?.error;

					state.value = {
						...state.value,
						pendingItemId: (
							action.payload as { pendingId: string; error: string }
						)?.pendingId,
						message: errMsg
					};

					toast.error(errMsg);
				}
			}
		)
	}),
	// You can define your selectors here. These selectors receive the slice
	// state as their first argument.
	selectors: {
		selectData: (counter) => counter.value,
		selectStatus: (counter) => counter.status,
		selectLog: (state) => state.log,
		selectDeletedItem: (state) => state.deletedItem,
		selectUpdatedItem: (state) => state.updatedItem,
		selectStateMessage: (state) => state.value.message,
		selectMacros: (state) => state.macros,
		selectCurrentLog: (state) => state.currentLog,
		selectBMRData: (state) => state.bmrData,
		selectCurrentDishItems: (state) => state.currentDishItems
	}
});

// Action creators are generated for each case reducer function.
export const {
	added,
	updated,
	deleted,
	expendedCaloriesUpdated,
	logFoodAsync,
	deleteLogItemAsync,
	updateItemAsync,
	reset,
	setCurrentLog,
	logCaloriesBurnedAsync,
	logPrepDishAsync
} = logFoodSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const {
	selectData,
	selectStatus,
	selectLog,
	selectDeletedItem,
	selectUpdatedItem,
	selectStateMessage,
	selectMacros,
	selectCurrentLog,
	selectBMRData,
	selectCurrentDishItems
} = logFoodSlice.selectors;

// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
// export const incrementIfOdd =
// 	(amount: number): AppThunk =>
// 	(dispatch, getState) => {
// 		const currentValue = selectCount(getState());

// 		if (currentValue % 2 === 1 || currentValue % 2 === -1) {
// 			dispatch(incrementByAmount(amount));
// 		}
// 	};

const deserFoodItemsMacros = (items: SerializedFoodItems) => {
	// must deserialize first to pass to totalMacrosReducer
	const foodEntriesDeserialized = [...items].map((item) => ({
		...item,
		description: item.description ?? '',
		image: item.image ?? '',
		eatenAt: new Date(item.eatenAt)
	}));

	const { calories, carbs, fat, protein } = totalMacrosReducer(
		foodEntriesDeserialized
	);

	return {
		totalCarbs: carbs,
		totalFat: fat,
		totalProtein: protein,
		caloriesConsumed: calories
	};
};
