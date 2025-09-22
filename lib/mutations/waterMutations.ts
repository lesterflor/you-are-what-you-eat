import { todaysWaterConsumed } from '@/actions/log-actions';
import { mutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';

export function logWaterMutationOptions() {
	return mutationOptions({
		mutationKey: ['mutateLogWater'],
		mutationFn: (amt: number) => todaysWaterConsumed(amt),
		onSuccess: (res) => toast.success(res.message),
		onError: (res) => toast.error(res.message)
	});
}
