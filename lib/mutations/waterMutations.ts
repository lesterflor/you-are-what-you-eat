import { todaysWaterConsumed } from '@/actions/log-actions';
import { getQueryClient } from '@/components/query-provider';
import { mutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getCurrentWaterQueryOptions } from '../queries/waterQueries';

const query = getQueryClient();

export function logWaterMutationOptions() {
	return mutationOptions({
		mutationKey: ['mutateLogWater'],
		mutationFn: (amt: number) => todaysWaterConsumed(amt),
		onSuccess: (res) => {
			// invalidate water cache
			query.invalidateQueries({
				queryKey: getCurrentWaterQueryOptions().queryKey
			});
			toast.success(res.message);
		},
		onError: (res) => toast.error(res.message)
	});
}
