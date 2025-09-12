'use client';

import { selectMacros, selectStatus } from '@/lib/features/log/logFoodSlice';
import { useAppSelector } from '@/lib/hooks';
import { cn, formatUnit } from '@/lib/utils';
import { ArrowDown, ArrowUp, Frown, Smile } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function RemainingCalories({
	iconPosition = 'top'
}: {
	iconPosition?: 'right' | 'top';
}) {
	const logMacros = useAppSelector(selectMacros);
	const logDataStatus = useAppSelector(selectStatus);

	const [userInfo, setUserInfo] = useState<
		| {
				consumed: number;
				burned: number;
				remaining: number;
				bmr?: number;
				cumulativeRemaining: number;
		  }
		| undefined
	>(undefined);

	useEffect(() => {
		if (
			(logDataStatus === 'updated' ||
				logDataStatus === 'initial' ||
				logDataStatus === 'added' ||
				logDataStatus === 'deleted' ||
				logDataStatus === 'loggedCalories' ||
				logDataStatus === 'loggedDish') &&
			logMacros
		) {
			const {
				caloriesBurned = 0,
				caloriesConsumed = 0,
				caloriesRemaining = 0,
				bmr = 0
			} = logMacros;

			setUserInfo({
				consumed: caloriesConsumed,
				burned: caloriesBurned,
				remaining: caloriesRemaining,
				bmr,
				cumulativeRemaining: caloriesRemaining
			});
		}
	}, [logMacros, logDataStatus]);

	return (
		<>
			{userInfo && userInfo?.bmr !== 0 ? (
				<div className='portrait:w-[100%]'>
					<div
						className={cn(
							'transition-opacity fade-in animate-in duration-1000 text-2xl text-center flex flex-col items-center gap-0 relative font-bold',
							Math.sign(userInfo.cumulativeRemaining) === -1
								? 'text-foreground'
								: 'text-muted-foreground'
						)}>
						<div className='font-semibold'>
							{Math.abs(formatUnit(userInfo.cumulativeRemaining))}
						</div>
						<div className='text-xs font-normal'>
							{Math.sign(userInfo.cumulativeRemaining) === -1
								? 'calories remaining'
								: 'calories over'}
						</div>

						{userInfo.consumed > 0 ? (
							<div
								className={cn(
									'absolute flex flex-row items-center gap-0',
									iconPosition === 'top' ? '-top-6 right-2' : 'top-4 -right-6'
								)}>
								{Math.sign(userInfo.cumulativeRemaining) === -1 ? (
									<>
										<ArrowDown className='w-6 h-6 text-green-600 animate-bounce' />
										<Smile className='w-6 h-6' />
									</>
								) : (
									<>
										<ArrowUp className='w-6 h-6 text-red-600 animate-bounce' />
										<Frown className='w-6 h-6' />
									</>
								)}
							</div>
						) : (
							<div
								className={cn(
									'absolute flex flex-row items-center gap-0',
									iconPosition === 'top' ? '-top-6 right-2' : 'top-4 -right-6'
								)}>
								<div className='w-6 h-6	'></div>
							</div>
						)}
					</div>
				</div>
			) : (
				<div className='flex flex-col items-center justify-center w-[25vw]'></div>
			)}
		</>
	);
}
