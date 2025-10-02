import LogEntrySkeleton from '@/components/logs/log-entry-skeleton';
import LogHistoryTitle from '@/components/logs/log-history-title';
import { auth } from '@/db/auth';
import {
	getBMRByIdQueryOptions,
	getLogByUserIdQueryOptions
} from '@/lib/queries/logQueries';
import { getAllUserWaterConsumptionQueryOptions } from '@/lib/queries/waterQueries';
import { GetUser } from '@/types';
import {
	dehydrate,
	HydrationBoundary,
	QueryClient
} from '@tanstack/react-query';
import { Metadata } from 'next';
import { lazy, Suspense } from 'react';

const LogHistoryLazy = lazy(() => import('@/components/logs/log-history'));

export const metadata: Metadata = {
	title: 'Log History | You Are What You Eat'
};

export default async function LogsPage() {
	const session = await auth();
	const user = session?.user as GetUser;
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
		<HydrationBoundary state={dehydrate(queryClient)}>
			{session && user.id && (
				<div className='flex flex-col gap-4 relative'>
					<LogHistoryTitle />

					<Suspense fallback={<LogEntrySkeleton />}>
						<LogHistoryLazy />
					</Suspense>
				</div>
			)}
		</HydrationBoundary>
	);
}
