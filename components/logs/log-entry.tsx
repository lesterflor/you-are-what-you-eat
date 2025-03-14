import { GetFoodEntry, GetLog } from '@/types';
import { Calendar } from 'lucide-react';
import React from 'react';
import LogMacrosSummary from './log-macros-summary';
import LogFoodCard from './log-food-card';
import { Separator } from '../ui/separator';
import { format } from 'date-fns';

export default function LogEntry({ log }: { log: GetLog }) {
	return (
		<div className='flex flex-col gap-6'>
			<div className='flex flex-row portrait:flex-col items-center justify-between gap-2 rounded-md border-2 p-2'>
				<div className='flex flex-row gap-2 items-center'>
					<Calendar className='w-4 h-4 portrait:w-6 portrait:h-6  ' />
					<div className='portrait:text-sm'>{format(log.createdAt, 'PPP')}</div>
				</div>

				<div className='hidden portrait:block'>
					<LogMacrosSummary
						compactMode={true}
						getTodayMode={false}
						log={log as GetLog}
					/>
				</div>
				<div className='portrait:hidden'>
					<LogMacrosSummary
						getTodayMode={false}
						log={log as GetLog}
					/>
				</div>
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
	);
}
