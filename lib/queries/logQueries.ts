import { getCurrentActivityLog } from '@/actions/activity-log-actions';
import { getBMRById } from '@/actions/bmr-actions';
import {
	createDailyLog,
	getCommonItemsInLog,
	getLogRemainder,
	getLogRemainderByUserIdInRange,
	getLogsByUserId
} from '@/actions/log-actions';
import { formatUnit, totalMacrosReducer } from '@/lib/utils';
import { queryOptions } from '@tanstack/react-query';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { GetFoodEntry } from '../../types/index';

export function getCurrentLogQueryOptions() {
	return queryOptions({
		queryKey: ['currentLog'],
		queryFn: () => createDailyLog(true),
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

export function getLogByUserIdQueryOptions() {
	return queryOptions({
		queryKey: ['getLogByUserIdQuery'],
		queryFn: () => getLogsByUserId(),
		select: (res) => res.data
	});
}

export function getBMRByIdQueryOptions(userId: string) {
	return queryOptions({
		queryKey: ['bmrByUserIdQuery', userId],
		queryFn: () => getBMRById(userId),
		select: (res) => res.data
	});
}

export function getCurrentActivityLogQueryOptions() {
	return queryOptions({
		queryKey: ['currentActivityLogQuery'],
		queryFn: getCurrentActivityLog,
		select: (res) => {
			if (res?.data) {
				const sorted = res.data.activityItems
					.filter((item) => !!item.data)
					.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

				return { ...res.data, activityItems: sorted };
			}

			return res?.data;
		}
	});
}

export function getCommonItemsQueryOptions() {
	return queryOptions({
		queryKey: ['commonItemsQuery'],
		queryFn: getCommonItemsInLog,
		select: (res) => {
			if (res.success && res.data && res.data.length > 0) {
				const result = Object.groupBy(
					res.data,
					({ category }: GetFoodEntry) => category
				);

				const { fruit, grain, legume, meat, nutSeed, other, veg } = result;

				const t = Object.values(result).reduce(
					(acc, curr) => acc + (curr?.length || 0),
					0
				);

				return {
					firstDate: res?.firstLog.createdAt ?? new Date(),
					categories: {
						fruit: fruit?.length || 0,
						grain: grain?.length || 0,
						legume: legume?.length || 0,
						meat: meat?.length || 0,
						nutSeed: nutSeed?.length || 0,
						other: other?.length || 0,
						veg: veg?.length || 0,
						total: t
					}
				};
			}
		}
	});
}
