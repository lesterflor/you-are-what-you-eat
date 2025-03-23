import { getLogsByUserId } from '@/actions/log-actions';
import DayLogChart from '@/components/logs/day-log-chart';
import LogEntry from '@/components/logs/log-entry';
import { Button } from '@/components/ui/button';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetTitle,
	SheetTrigger
} from '@/components/ui/sheet';
import { auth } from '@/db/auth';
import { GetLog, GetUser } from '@/types';
import { CalendarOff, ChartArea } from 'lucide-react';
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import React from 'react';

export const metadata: Metadata = {
	title: 'Log History'
};

export default async function LogsPage() {
	const session = await auth();
	const user = session?.user as GetUser;

	if (!session || !user.id) {
		redirect('/');
	}

	const res = await getLogsByUserId(user.id);

	const { data = [] } = res;

	return (
		<div className='flex flex-col gap-4'>
			<div className='text-xl font-semibold flex flex-row items-center justify-between relative'>
				<div>Log History</div>
				<div>
					<Sheet>
						<SheetTrigger asChild>
							<Button size='icon'>
								<ChartArea className='w-6 h-6' />
							</Button>
						</SheetTrigger>
						<SheetContent className='portrait:max-w-[100vw] portrait:w-[100vw]'>
							<SheetDescription />
							<SheetTitle className='pb-4'>Log Data</SheetTitle>
							<DayLogChart fetchSelf={true} />
						</SheetContent>
					</Sheet>
				</div>
			</div>
			{data && data.length > 0 ? (
				data.map((log) => (
					<LogEntry
						key={log.id}
						log={log as GetLog}
					/>
				))
			) : (
				<div className='flex flex-row items-center gap-2 text-muted-foreground'>
					<CalendarOff className='w-12 h-12' />
					No History
				</div>
			)}
		</div>
	);
}
