'use client';

import { selectMacros, selectStatus } from '@/lib/features/log/logFoodSlice';
import {
	selectUserData,
	selectUserDataStatus
} from '@/lib/features/user/userDataSlice';
import { useAppSelector } from '@/lib/hooks';
import { formatUnit } from '@/lib/utils';
import { useEffect, useState } from 'react';

export default function ExpendedBadge() {
	const userData = useAppSelector(selectUserData);
	const userDataStatus = useAppSelector(selectUserDataStatus);
	const logMacros = useAppSelector(selectMacros);
	const logDataStatus = useAppSelector(selectStatus);

	const [calsBurned, setCalsBurned] = useState(0);

	useEffect(() => {
		if (logDataStatus === 'initial' && logMacros.caloriesBurned) {
			setCalsBurned(logMacros.caloriesBurned);
		}
	}, [logMacros, logDataStatus]);

	useEffect(() => {
		if (
			(userDataStatus === 'loggedCalories' || userDataStatus === 'updated') &&
			userData
		) {
			setCalsBurned(
				userData.caloricData ? JSON.parse(userData.caloricData).burned : 0
			);
		}
	}, [userData, userDataStatus]);

	return (
		<>
			{calsBurned > 0 && (
				<div className='transition-opacity fade-in animate-in duration-1000 p-1 rounded-md border-2 font-normal text-xs flex flex-col gap-0 items-center w-16'>
					<span>Expended</span>
					<span>{formatUnit(calsBurned)}</span>
				</div>
			)}
		</>
	);
}
