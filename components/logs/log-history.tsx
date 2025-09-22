'use client';

import {
	getBMRByIdQueryOptions,
	getLogByUserIdQueryOptions
} from '@/lib/queries/logQueries';
import { getAllUserWaterConsumptionQueryOptions } from '@/lib/queries/waterQueries';
import { colateBMRData } from '@/lib/utils';
import { BMRData, GetLog, GetUser } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { CalendarOff } from 'lucide-react';
import { useSession } from 'next-auth/react';
import LogEntry from './log-entry';

export default function LogHistory() {
	const { data: session } = useSession();
	const user = session?.user as GetUser;

	const { data: logData } = useQuery(getLogByUserIdQueryOptions());
	const { data: bmrData } = useQuery(getBMRByIdQueryOptions(user.id));
	const userInfo = colateBMRData(bmrData as BMRData);
	const { data: userWaterLogs } = useQuery(
		getAllUserWaterConsumptionQueryOptions()
	);

	return (
		<>
			{logData && logData.length > 0 ? (
				logData.map((log) => (
					<LogEntry
						key={log.id}
						log={log as GetLog}
						userInfo={userInfo}
						waterLogs={userWaterLogs}
					/>
				))
			) : (
				<div className='flex flex-row items-center gap-2 text-muted-foreground'>
					<CalendarOff className='w-12 h-12' />
					No History
				</div>
			)}
		</>
	);
}
