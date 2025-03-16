import { GetFoodEntry, GetLog } from '@/types';
import { Calendar, CookingPot, Frown, Smile } from 'lucide-react';
import React from 'react';
import LogMacrosSummary from './log-macros-summary';
import LogFoodCard from './log-food-card';
import { Separator } from '../ui/separator';
import { format } from 'date-fns';
import { getUserBMR } from '@/actions/bmr-actions';
import { cn, formatUnit, totalMacrosReducer } from '@/lib/utils';
import TruncateSection from '../truncate-section';

export default async function LogEntry({ log }: { log: GetLog }) {
	const bmrData = await getUserBMR();

	const bmr = bmrData.data ? bmrData.data.bmr : 0;
	const kcBurned =
		(log.knownCaloriesBurned &&
			log.knownCaloriesBurned.length > 0 &&
			log.knownCaloriesBurned[0].calories) ||
		0;

	const { calories } = totalMacrosReducer(log.foodItems);
	const surplus = bmr + kcBurned;
	const calDiff = formatUnit(surplus - calories);
	const overUsedDailyCals = Math.sign(calDiff) === -1;

	return (
		<div className='flex flex-col gap-6'>
			<div className='flex flex-row portrait:flex-col items-center justify-between gap-4 rounded-md border-2 p-2'>
				<div className='flex flex-col items-center gap-2'>
					<div className='flex flex-row gap-2 items-center justify-center'>
						<Calendar className='w-4 h-4 portrait:w-6 portrait:h-6  ' />
						<div className='portrait:text-sm'>
							{format(log.createdAt, 'PPP')}
						</div>
					</div>
					{bmrData.data && (
						<div className='flex flex-col gap-2 text-xs'>
							<div className='flex flex-row items-center gap-2 rounded-md border-2 p-1'>
								<span className='text-muted-foreground'>BMR:</span>{' '}
								{formatUnit(bmr)}
								<span className='text-muted-foreground'>calories</span>
							</div>

							<div className='flex flex-row items-center justify-start gap-2 rounded-md border-2 p-1'>
								<span className='text-muted-foreground'>Total Calories:</span>{' '}
								{formatUnit(calories)}
								<span className='text-muted-foreground'>calories</span>
							</div>

							<div className='flex flex-row items-center justify-start gap-2 rounded-md border-2 p-1'>
								<span className='text-muted-foreground'>
									Known calories burned:
								</span>{' '}
								{formatUnit(kcBurned)}
								<span className='text-muted-foreground'>calories</span>
							</div>

							<div
								className={cn(
									'text-2xl font-bold w-full text-center flex flex-row items-center gap-2 justify-center',
									overUsedDailyCals
										? 'text-muted-foreground'
										: 'text-foreground'
								)}>
								{calDiff}
								{overUsedDailyCals ? (
									<Frown className='w-6 h-6' />
								) : (
									<Smile className='w-6 h-6' />
								)}
							</div>
						</div>
					)}
				</div>

				<div className='hidden portrait:block'>
					<LogMacrosSummary
						compactMode={true}
						detailedMode={true}
						getTodayMode={false}
						log={log as GetLog}
					/>
				</div>
				<div className='portrait:hidden'>
					<LogMacrosSummary
						detailedMode={true}
						getTodayMode={false}
						log={log as GetLog}
					/>
				</div>
			</div>

			{log.foodItems.length > 1 ? (
				<TruncateSection
					allowSeeMore={true}
					label='See more'
					pixelHeight={300}>
					<div className='flex portrait:flex-col md:grid grid-cols-2 flex-col gap-4'>
						{log.foodItems.map((food, indx) => (
							<LogFoodCard
								key={`${food.id}-${indx}`}
								item={food as GetFoodEntry}
							/>
						))}
					</div>
				</TruncateSection>
			) : log.foodItems.length === 0 ? (
				<div className='flex flex-row items-center gap-2 text-muted-foreground'>
					<CookingPot className='w-4 h-4' />
					No food was entered on this day
				</div>
			) : (
				<div className='flex portrait:flex-col md:grid grid-cols-2 flex-col gap-4'>
					{log.foodItems.map((food, indx) => (
						<LogFoodCard
							key={`${food.id}-${indx}`}
							item={food as GetFoodEntry}
						/>
					))}
				</div>
			)}

			<Separator />
			<br />
		</div>
	);
}
