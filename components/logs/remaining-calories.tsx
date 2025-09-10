'use client';

import {
	selectUserData,
	selectUserDataStatus
} from '@/lib/features/user/userDataSlice';
import { useAppSelector } from '@/lib/hooks';
import { cn, formatUnit } from '@/lib/utils';
import { ArrowDown, ArrowUp, Frown, Smile } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function RemainingCalories({
	iconPosition = 'top'
}: {
	iconPosition?: 'right' | 'top';
}) {
	const userData = useAppSelector(selectUserData);
	const userDataStatus = useAppSelector(selectUserDataStatus);

	const [userInfo, setUserInfo] = useState<
		| {
				consumed: number;
				burned: number;
				remaining: number;
				bmr?: number;
		  }
		| undefined
	>(undefined);

	useEffect(() => {
		if (userDataStatus === 'updated' && userData) {
			const { consumed, burned, remaining } = JSON.parse(
				userData.caloricData || '{}'
			);

			const bmrData = JSON.parse(userData.bmrData || '{}');
			const bmr = bmrData?.bmr || 0;

			setUserInfo({
				consumed,
				burned,
				remaining,
				bmr
			});
		}
	}, [userData, userDataStatus]);

	return (
		<>
			{userInfo && userInfo?.bmr !== 0 ? (
				<div className='portrait:w-[100%]'>
					<div
						className={cn(
							'transition-opacity fade-in animate-in duration-1000 text-2xl text-center flex flex-col items-center gap-0 relative font-bold',
							Math.sign(userInfo.remaining) === -1
								? 'text-foreground'
								: 'text-muted-foreground'
						)}>
						<div className='font-semibold'>
							{Math.abs(formatUnit(userInfo.remaining))}
						</div>
						<div className='text-xs font-normal'>
							{Math.sign(userInfo.remaining) === -1
								? 'calories remaining'
								: 'calories over'}
						</div>

						{userInfo.consumed > 0 ? (
							<div
								className={cn(
									'absolute flex flex-row items-center gap-0',
									iconPosition === 'top' ? '-top-6 right-2' : 'top-4 -right-6'
								)}>
								{Math.sign(userInfo.remaining) === -1 ? (
									<>
										<ArrowDown className='w-6 h-6 text-green-600 animate-bounce' />
										<Smile className='w-6 h-6' />
									</>
								) : (
									<div>
										<ArrowUp className='w-6 h-6 text-red-600 animate-bounce' />
										<Frown className='w-6 h-6' />
									</div>
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
