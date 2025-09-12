'use client';

import { selectMacros, selectStatus } from '@/lib/features/log/logFoodSlice';
import {
	selectUserData,
	selectUserDataStatus
} from '@/lib/features/user/userDataSlice';
import { useAppSelector } from '@/lib/hooks';
import { formatUnit } from '@/lib/utils';
import { useEffect, useState } from 'react';

export default function BMRBadge() {
	const [bmr, setBmr] = useState<number | undefined>();

	const userData = useAppSelector(selectUserData);
	const userDataStatus = useAppSelector(selectUserDataStatus);

	const logMacros = useAppSelector(selectMacros);
	const logDataStatus = useAppSelector(selectStatus);

	useEffect(() => {
		if (logDataStatus === 'initial' && logMacros) {
			setBmr(logMacros.bmr);
		}
	}, [logMacros, logDataStatus]);

	useEffect(() => {
		if (userDataStatus === 'updated') {
			const ser = JSON.parse(userData.bmrData);
			setBmr(ser.bmr);
		}
	}, [userData, userDataStatus]);

	return (
		<div className='h-11'>
			{bmr && bmr > 0 && (
				<div className='transition-opacity fade-in animate-in duration-1000 p-1 rounded-md border-2 items-center font-normal text-xs flex flex-col gap-0 w-16'>
					<span>BMR</span>
					<span>{formatUnit(bmr)}</span>
				</div>
			)}
		</div>
	);
}
