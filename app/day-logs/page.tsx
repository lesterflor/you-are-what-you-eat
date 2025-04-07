import DayLogChart from '@/components/logs/day-log-chart';
import { auth } from '@/db/auth';
import { GetUser } from '@/types';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function AllLogs() {
	const session = await auth();

	if (!session) {
		redirect('/');
	}

	const user = session.user as GetUser;

	if (!session || !user) {
		redirect('/');
	}

	return (
		<div>
			<DayLogChart />
		</div>
	);
}
