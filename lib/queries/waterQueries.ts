import {
	getAllUserWaterConsumption,
	todaysWaterConsumed
} from '@/actions/log-actions';
import { queryOptions } from '@tanstack/react-query';

export function getCurrentWaterQueryOptions() {
	return queryOptions({
		queryKey: ['currentWater'],
		queryFn: () => todaysWaterConsumed(),
		select: (res) => res.data
	});
}

export function getAllUserWaterConsumptionQueryOptions() {
	return queryOptions({
		queryKey: ['allUserWaterConsumptionQuery'],
		queryFn: () => getAllUserWaterConsumption(),
		select: (res) => res.data
	});
}
