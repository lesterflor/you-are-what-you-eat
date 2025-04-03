'use client';

import { CircleX } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { useAppSelector } from '@/lib/hooks';
import { selectFoodSearchStatus } from '@/lib/features/food/foodSearchSlice';

export default function InputWithButton({
	children,
	onChange,
	className
}: {
	children?: React.ReactNode;
	onChange: (val: string) => void;
	className?: string;
}) {
	const [search, setSearch] = useState('');
	const [isReduxMsg, setIsReduxMsg] = useState(false);
	const foodSearchStatus = useAppSelector(selectFoodSearchStatus);

	useEffect(() => {
		if (!isReduxMsg) {
			onChange(search);
		}
	}, [search]);

	useEffect(() => {
		if (foodSearchStatus !== 'input' && foodSearchStatus !== 'idle') {
			setIsReduxMsg(true);
			setSearch('');
		}
	}, [foodSearchStatus]);

	return (
		<div className={cn('relative', className)}>
			<div className='flex flex-row items-center gap-2'>
				{children}
				<Input
					className='pr-10'
					value={search}
					onChange={(e) => {
						setIsReduxMsg(false);
						setSearch(e.target.value);
					}}
				/>
			</div>

			<Button
				variant='ghost'
				className='absolute top-0 right-0 h-full px-4'
				onClick={() => {
					setSearch('');
				}}>
				<CircleX
					className={cn('w-6 h-6 opacity-50', search ? 'block' : 'hidden')}
				/>
			</Button>
		</div>
	);
}
