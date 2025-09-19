import {
	createDailyLog,
	getLogRemainder,
	getLogRemainderByUserIdInRange
} from '@/actions/log-actions';
import { formatUnit, totalMacrosReducer } from '@/lib/utils';
import { queryOptions } from '@tanstack/react-query';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { GetFoodEntry } from './../../types/index';

export function getCurrentLogQueryOptions() {
	return queryOptions({
		queryKey: ['currentLog'],
		queryFn: () => createDailyLog(),
		select: (res) => {
			if (res?.data) {
				return {
					...res.data,
					foodItems: res.data.foodItems.map((item) => ({
						...item,
						description: item.description as string,
						image: item.image as string
					}))
				};
			}
		}
	});
}

export function getLogRemainderQueryOptions() {
	return queryOptions({
		queryKey: ['getLogRemainderQuery'],
		queryFn: getLogRemainder,
		select: (res) => res.data
	});
}

export function getLogRemainderInRangeQueryOptions(
	range: DateRange | undefined,
	enabled = true
) {
	return queryOptions({
		queryKey: ['getLogRemainderInRangeQuery', range],
		queryFn: () => (range ? getLogRemainderByUserIdInRange(range) : null),
		enabled,
		select: (res) => {
			if (res?.data) {
				const amt = res.data.reduce(
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

				return {
					chartData: res.data.map((item) => ({
						calories: formatUnit(
							item.knownCaloriesBurned[0].calories +
								item.user.BaseMetabolicRate[0].bmr -
								totalMacrosReducer(item.foodItems as GetFoodEntry[]).calories
						),
						createdAt: format(item.createdAt, 'P')
					})),
					remainders: res.data,
					text: phrase
				};
			}
		}
	});
}
