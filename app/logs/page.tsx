import { getBMRById } from '@/actions/bmr-actions';
import {
	getAllUserWaterConsumption,
	getLogsByUserId
} from '@/actions/log-actions';
import LogEntrySkeleton from '@/components/logs/log-entry-skeleton';
import LogHistory from '@/components/logs/log-history';
import LogHistoryTitle from '@/components/logs/log-history-title';
import { auth } from '@/db/auth';
import { GetUser } from '@/types';
import { QueryClient } from '@tanstack/react-query';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export const metadata: Metadata = {
	title: 'Log History'
};

export default async function LogsPage(props: {
	searchParams: Promise<{
		logId: string;
	}>;
}) {
	const session = await auth();
	const user = session?.user as GetUser;

	if (!session || !user.id) {
		redirect('/');
	}

	const queryClient = new QueryClient();

	const { logId = '' } = await props.searchParams;

	await Promise.all([
		queryClient.prefetchQuery({
			queryKey: ['logsByUserId', logId],
			queryFn: () => getLogsByUserId(logId)
		}),
		queryClient.prefetchQuery({
			queryKey: ['bmrByUserId', user.id],
			queryFn: () => getBMRById(user.id)
		}),
		queryClient.prefetchQuery({
			queryKey: ['allUserWaterConsumption'],
			queryFn: () => getAllUserWaterConsumption()
		})
	]);

	return (
		<div className='flex flex-col gap-4 relative'>
			<LogHistoryTitle />

			<Suspense fallback={<LogEntrySkeleton />}>
				<LogHistory logId={logId} />
			</Suspense>
		</div>
	);
}
