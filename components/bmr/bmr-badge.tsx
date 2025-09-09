'use client';

import {
	selectUserData,
	selectUserDataStatus
} from '@/lib/features/user/userDataSlice';
import { useAppSelector } from '@/lib/hooks';
import { formatUnit } from '@/lib/utils';
import { BaseMetabolicRateType } from '@/types';
import { useEffect, useState } from 'react';

export default function BMRBadge() {
	const [bmr, setBmr] = useState<BaseMetabolicRateType>();

	const userData = useAppSelector(selectUserData);
	const userDataStatus = useAppSelector(selectUserDataStatus);

	useEffect(() => {
		if (userDataStatus === 'updated') {
			setBmr(JSON.parse(userData.bmrData));
		}
	}, [userData, userDataStatus]);

	return (
		<div className='h-11'>
			{bmr && (
				<div className='transition-opacity fade-in animate-in duration-1000 p-1 rounded-md border-2 items-center font-normal text-xs flex flex-col gap-0 w-16'>
					<span>BMR</span>
					<span>{formatUnit(bmr.bmr)}</span>
				</div>
			)}
		</div>
	);
}
