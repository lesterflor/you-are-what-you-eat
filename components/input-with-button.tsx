'use client';

import { selectFoodSearchStatus } from '@/lib/features/food/foodSearchSlice';
import { useAppSelector } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { CircleX } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

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
					data-testid='input-field'
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
				className={cn(
					'absolute top-0 right-0 h-full px-4',
					search ? 'block' : 'hidden'
				)}
				onClick={() => {
					setSearch('');
				}}>
				<CircleX className='opacity-50' />
			</Button>
		</div>
	);
}
