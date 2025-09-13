import {
	getLogRemainder,
	getLogRemainderByUserIdInRange
} from '@/actions/log-actions';
import { createAppSlice } from '@/lib/createAppSlice';
import { formatUnit, totalMacrosReducer } from '@/lib/utils';
import { GetFoodEntry, LogRemainderDataType } from '@/types';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { toast } from 'sonner';

export interface LogRemainderSliceState {
	value: LogRemainderDataType;
	chartData?: {
		data: ChartData[];
		logs: string[];
		text: string;
	};
	message: string;
	status:
		| 'idle'
		| 'fetching'
		| 'fetched'
		| 'fetchingChartData'
		| 'fetchedChartData'
		| 'failed';
}

type ChartData = {
	calories: number;
	createdAt: string;
};

const initialState: LogRemainderSliceState = {
	value: {
		remainder: 0,
		yesterdaysConsumed: 0,
		todaysConsumed: 0,
		bmr: 0,
		yesterdaysExpended: 0,
		yesterdaysRemainder: 0
	},
	message: '',
	status: 'idle'
};

export const logRemainderSlice = createAppSlice({
	name: 'logRemainder',
	initialState,
	reducers: (create) => ({
		getRemaining: create.asyncThunk(
			async (_, { rejectWithValue }) => {
				const res = await getLogRemainder();

				if (res.success && res.data) {
					return res.data;
				}

				return rejectWithValue({ error: res.message });
			},
			{
				pending: (state) => {
					state.status = 'fetching';
				},
				fulfilled: (state, action) => {
					state.status = 'fetched';
					state.value = action.payload;
				},
				rejected: (state, action) => {
					const errMsg = (action.payload as { error: string }).error;
					state.status = 'failed';
					state.message = errMsg;
					toast.error(errMsg);
				}
			}
		),

		fetchLogRemaindersInRange: create.asyncThunk(
			async (range: DateRange, { rejectWithValue }) => {
				const res = await getLogRemainderByUserIdInRange(range);

				if (res.success && res.data) {
					return {
						chartData: res.data.map((item) => ({
							calories: formatUnit(
								item.knownCaloriesBurned[0].calories +
									item.user.BaseMetabolicRate[0].bmr -
									totalMacrosReducer(item.foodItems as GetFoodEntry[]).calories
							),
							createdAt: format(item.createdAt, 'P')
						})),
						remainders: res.data.map((item) => JSON.stringify(item))
					};
				}

				return rejectWithValue({ error: res.message });
			},
			{
				pending: (state) => {
					state.status = 'fetchingChartData';
				},
				fulfilled: (state, action) => {
					state.status = 'fetchedChartData';

					if (
						action.payload.remainders &&
						action.payload.remainders.length > 0
					) {
						const deSer = [...action.payload.remainders].map((item) =>
							JSON.parse(item)
						);

						const amt = deSer.reduce(
							(acc, curr) =>
								acc +
								curr.knownCaloriesBurned[0].calories +
								curr.user.BaseMetabolicRate[0].bmr -
								totalMacrosReducer(curr.foodItems as GetFoodEntry[]).calories,
							0
						);

						let phrase = '';
						const frmRemainder = formatUnit(amt / 1200);

						switch (true) {
							case frmRemainder === 1:
								phrase = 'pound lost';
								break;
							case frmRemainder === -1:
								phrase = 'pound gained';
								break;
							case frmRemainder > 1:
								phrase = 'pounds lost';
								break;
							case frmRemainder < 0:
								phrase = 'pounds gained';
								break;
							default:
								phrase = 'pounds lost';
						}

						state.chartData = {
							data: action.payload.chartData,
							logs: action.payload.remainders,
							text: phrase
						};
					}
				},
				rejected: (state, action) => {
					const errMsg = (action.payload as { error: string }).error;
					state.status = 'failed';
					state.message = errMsg;
					toast.error(errMsg);
				}
			}
		)
	}),
	selectors: {
		selectRemainderData: (state) => state.value,
		selectRemainderStatus: (state) => state.status,
		selectRemainderChartData: (state) => state.chartData
	}
});

export const { getRemaining, fetchLogRemaindersInRange } =
	logRemainderSlice.actions;

export const {
	selectRemainderData,
	selectRemainderStatus,
	selectRemainderChartData
} = logRemainderSlice.selectors;
