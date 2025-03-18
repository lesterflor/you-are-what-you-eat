'use client';

import { CircleX } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import { useContext, useEffect, useState } from 'react';
import {
	FoodContextSearchType,
	FoodSearchContext
} from '@/contexts/food-search-context';

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
	const foodContext = useContext(FoodSearchContext);

	useEffect(() => {
		onChange(search);
	}, [search]);

	useEffect(() => {
		if (foodContext && foodContext.searchType === 'category') {
			setSearch('');
		}
	}, [foodContext]);

	return (
		<div className={cn('relative', className)}>
			<div className='flex flex-row items-center gap-2'>
				{children}
				<Input
					className='pr-10'
					value={search}
					onChange={(e) => {
						if (foodContext && foodContext.updateSearchType) {
							const update = {
								...foodContext,
								searchType: 'input' as FoodContextSearchType
							};

							foodContext.updateSearchType(update);
						}
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
