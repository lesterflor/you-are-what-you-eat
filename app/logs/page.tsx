import { getBMRById } from '@/actions/bmr-actions';
import { getLogsByUserId } from '@/actions/log-actions';
import LogEntry from '@/components/logs/log-entry';
import LogHistoryTitle from '@/components/logs/log-history-title';
import { auth } from '@/db/auth';
import { colateBMRData } from '@/lib/utils';
import { BMRData, GetLog, GetUser } from '@/types';
import { CalendarOff } from 'lucide-react';
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

	const { logId = '' } = await props.searchParams;

	const res = await getLogsByUserId(logId);

	const { data = [] } = res;

	const bmrRes = await getBMRById(user.id);

	const { data: bmrData } = bmrRes;
	const userInfo = colateBMRData(bmrData as BMRData);

	return (
		<div className='flex flex-col gap-4 relative'>
			<LogHistoryTitle />

			<Suspense fallback={'Loading...'}>
				{data && data.length > 0 ? (
					data.map((log) => (
						<LogEntry
							key={log.id}
							log={log as GetLog}
							userInfo={userInfo}
						/>
					))
				) : (
					<div className='flex flex-row items-center gap-2 text-muted-foreground'>
						<CalendarOff className='w-12 h-12' />
						No History
					</div>
				)}
			</Suspense>
		</div>
	);
}
