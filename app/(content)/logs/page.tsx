import { getLogsByUserId } from '@/actions/log-actions';
import LogFoodCard from '@/components/logs/log-food-card';
import LogMacrosSummary from '@/components/logs/log-macros-summary';
import { Separator } from '@/components/ui/separator';
import { auth } from '@/db/auth';
import { GetFoodEntry, GetUser } from '@/types';
import { format } from 'date-fns';
import { Calendar } from 'lucide-react';
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
					<div
						key={log.id}
						className='flex flex-col gap-6'>
						<div className='flex flex-row items-center justify-between gap-2'>
							<div className='flex flex-row gap-2 items-center'>
								<Calendar className='w-4 h-4 portrait:w-10 portrait:h-10' />
								<div className='portrait:text-sm'>
									{format(log.createdAt, 'PPP')}
								</div>
							</div>

							<LogMacrosSummary />
						</div>
						<div className='flex portrait:flex-col md:grid grid-cols-2 flex-col gap-4'>
							{log.foodItems.map((food, indx) => (
								<LogFoodCard
									key={`${food.id}-${indx}`}
									item={food as GetFoodEntry}
								/>
							))}
						</div>

						<Separator />
						<br />
					</div>
				))}
		</div>
	);
}
