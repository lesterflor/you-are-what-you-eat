'use client';

import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';

export default function NumberIncrementor({
	value = 0,
	onChange,
	minValue = 0
}: {
	value?: number;
	onChange: (val: number) => void;
	minValue?: number;
}) {
	const [val, setVal] = useState(value);

	useEffect(() => {
		onChange(val);
	}, [val]);

	return (
		<div className='flex flex-row items-center justify-start gap-6 rounded-md border-2 p-2'>
			<div className='flex flex-row items-center gap-2'>
				<Button
					variant='outline'
					onClick={(e) => {
						e.preventDefault();
						if (val > minValue) {
							setVal((prev) => prev - 1);
						}
					}}>
					<ChevronLeft className='w-4 h-4 cur' />
				</Button>
				<Button
					variant='outline'
					onClick={(e) => {
						e.preventDefault();
						if (val > minValue) {
							setVal((prev) => prev - 0.5);
						}
					}}>
					<ChevronsLeft className='w-4 h-4 cur' />
				</Button>
			</div>
			<div className='text-2xl font-bold w-12 text-center'>{val}</div>
			<div className='flex flex-row items-center gap-2'>
				<Button
					variant='outline'
					onClick={(e) => {
						e.preventDefault();
						setVal((prev) => prev + 0.5);
					}}>
					<ChevronsRight className='w-4 h-4' />
				</Button>
				<Button
					variant='outline'
					onClick={(e) => {
						e.preventDefault();
						setVal((prev) => prev + 1);
					}}>
					<ChevronRight className='w-4 h-4' />
				</Button>
			</div>
		</div>
	);
}
