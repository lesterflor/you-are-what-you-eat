import { getLogsByUserId } from '@/actions/log-actions';
import LogEntry from '@/components/logs/log-entry';
import { auth } from '@/db/auth';
import { GetLog, GetUser } from '@/types';
import { redirect } from 'next/navigation';
import React from 'react';

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
			<div className='text-xl font-semibold'>Logs</div>
			{data &&
				data.length > 0 &&
				data.map((log) => (
					<LogEntry
						key={log.id}
						log={log as GetLog}
					/>
				))}
		</div>
	);
}
