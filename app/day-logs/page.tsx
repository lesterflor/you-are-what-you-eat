import { getLogsByUserId } from '@/actions/log-actions';
import DayLogChart from '@/components/logs/day-log-chart';
import { auth } from '@/db/auth';
import { DayLogDataType, GetUser } from '@/types';
import { format } from 'date-fns';
import { redirect } from 'next/navigation';
import React from 'react';

export default async function AllLogs() {
	const session = await auth();

	if (!session) {
		redirect('/');
	}

	const user = session.user as GetUser;
	const logs = await getLogsByUserId(user.id);

	if (!logs.success) {
		redirect('/');
	}

	const { data = [] } = logs;

	const mapData: DayLogDataType[] =
		data && data.length > 0
			? data.map((log) => ({
					day: format(log.createdAt, 'eee PP'),
					Expended:
						log.knownCaloriesBurned && log.knownCaloriesBurned.length > 0
							? log.knownCaloriesBurned[0].calories +
							  log.user.BaseMetabolicRate[0].bmr
							: log.user.BaseMetabolicRate[0].bmr,
					Calories: log.foodItems.reduce((acc, curr) => acc + curr.calories, 0),
					carb: log.foodItems.reduce((acc, curr) => acc + curr.carbGrams, 0),
					protein: log.foodItems.reduce(
						(acc, curr) => acc + curr.proteinGrams,
						0
					),
					fat: log.foodItems.reduce((acc, curr) => acc + curr.fatGrams, 0),
					totalGrams: log.foodItems.reduce(
						(acc, curr) =>
							acc + curr.fatGrams + curr.carbGrams + curr.proteinGrams,
						0
					)
			  }))
			: [];

	return (
		<div>
			<DayLogChart data={mapData} />
		</div>
	);
}
