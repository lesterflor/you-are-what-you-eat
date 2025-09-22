import LogEntrySkeleton from '@/components/logs/log-entry-skeleton';
import LogHistory from '@/components/logs/log-history';
import LogHistoryTitle from '@/components/logs/log-history-title';
import { auth } from '@/db/auth';
import {
	getBMRByIdQueryOptions,
	getLogByUserIdQueryOptions
} from '@/lib/queries/logQueries';
import { getAllUserWaterConsumptionQueryOptions } from '@/lib/queries/waterQueries';
import { GetUser } from '@/types';
import { QueryClient } from '@tanstack/react-query';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export const metadata: Metadata = {
	title: 'Log History'
};

export default async function LogsPage() {
	const session = await auth();
	const user = session?.user as GetUser;

	if (!session || !user.id) {
		redirect('/');
	}

	const queryClient = new QueryClient();

	await Promise.all([
		queryClient.prefetchQuery({
			queryKey: getLogByUserIdQueryOptions().queryKey,
			queryFn: getLogByUserIdQueryOptions().queryFn
		}),
		queryClient.prefetchQuery({
			queryKey: getBMRByIdQueryOptions(user.id).queryKey,
			queryFn: getBMRByIdQueryOptions(user.id).queryFn
		}),
		queryClient.prefetchQuery({
			queryKey: getAllUserWaterConsumptionQueryOptions().queryKey,
			queryFn: getAllUserWaterConsumptionQueryOptions().queryFn
		})
	]);

	return (
		<div className='flex flex-col gap-4 relative'>
			<LogHistoryTitle />

			<Suspense fallback={<LogEntrySkeleton />}>
				<LogHistory />
			</Suspense>
		</div>
	);
}
