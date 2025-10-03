import { queryOptions } from '@tanstack/react-query';
import { format } from 'date-fns';
import { getToday } from '../utils';

export function getTimeQueryOptions() {
	return queryOptions({
		queryKey: ['currentTime'],
		queryFn: () => getToday(),
		select: (data) => {
			return format(data.current, 'eee PP h:mm a');
		},
		refetchInterval: 60000
	});
}
