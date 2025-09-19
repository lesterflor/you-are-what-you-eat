import { getShareableUsers } from '@/actions/user-actions';
import { queryOptions } from '@tanstack/react-query';

export function getShareableUsersQueryOptions() {
	return queryOptions({
		queryKey: ['shareableUsersQuery'],
		queryFn: getShareableUsers,
		select: (res) => res.data
	});
}
