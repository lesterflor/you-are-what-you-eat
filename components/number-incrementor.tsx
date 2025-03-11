'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
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
		<div className='flex flex-row items-center justify-start gap-6'>
			<div>
				<Button
					variant='outline'
					onClick={(e) => {
						e.preventDefault();
						if (val > minValue) {
							setVal((prev) => prev - 1);
						}
					}}>
					<ChevronLeft className='w-6 h-6 cur' />
				</Button>
			</div>
			<div className='text-2xl font-bold'>{val}</div>
			<div>
				<Button
					variant='outline'
					onClick={(e) => {
						e.preventDefault();
						setVal((prev) => prev + 1);
					}}>
					<ChevronRight className='w-6 h-6' />
				</Button>
			</div>
		</div>
	);
}
