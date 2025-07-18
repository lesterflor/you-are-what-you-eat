'use client';

import { getUserBMR } from '@/actions/bmr-actions';
import { formatUnit } from '@/lib/utils';
import { BaseMetabolicRateType } from '@/types';
import { useEffect, useState, useTransition } from 'react';
import { ImSpinner2 } from 'react-icons/im';
import { Skeleton } from '../ui/skeleton';

export default function BMRBadge() {
	const [bmr, setBmr] = useState<BaseMetabolicRateType>();
	const [isFetching, setIsFetching] = useTransition();

	const fetchBMR = () => {
		setIsFetching(async () => {
			const res = await getUserBMR();

			if (res.success && res.data) {
				setIsFetching(() => {
					setBmr(res.data);
				});
			}
		});
	};

	useEffect(() => {
		fetchBMR();
	}, []);

	return (
		<div className='h-11'>
			{isFetching ? (
				<div className='flex items-center justify-center h-10 w-16'>
					<ImSpinner2 className='animate-spin w-6 h-6 opacity-10' />
				</div>
			) : bmr ? (
				<div className='transition-opacity fade-in animate-in duration-1000 p-1 rounded-md border-2 items-center font-normal text-xs flex flex-col gap-0 w-16'>
					<span>BMR</span>
					<span>{formatUnit(bmr.bmr)}</span>
				</div>
			) : (
				<div className='flex flex-row gap-2'>
					<Skeleton className='w-16 h-10' />
					<Skeleton className='w-16 h-10' />
				</div>
			)}

			{}
		</div>
	);
}
