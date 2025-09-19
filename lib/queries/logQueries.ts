import { createDailyLog } from '@/actions/log-actions';
import { queryOptions } from '@tanstack/react-query';

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
