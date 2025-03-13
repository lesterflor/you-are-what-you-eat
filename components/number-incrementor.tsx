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
	minValue = 0,
	maxValue = Infinity,
	allowDecimalIncrement = true
}: {
	value?: number;
	onChange: (val: number) => void;
	minValue?: number;
	allowDecimalIncrement?: boolean;
	maxValue?: number;
}) {
	const [val, setVal] = useState(value);

	useEffect(() => {
		onChange(Number(val % 1 > 0 ? val.toFixed(1) : val));
	}, [val]);

	return (
		<div className='flex flex-row items-center justify-start gap-6 rounded-md border-2 p-2'>
			<div className='flex flex-row items-center gap-2'>
				<Button
					size='icon'
					variant='outline'
					onClick={(e) => {
						e.preventDefault();
						if (val > minValue) {
							setVal((prev) => {
								const pre = prev - 1;
								if (pre < minValue) {
									return minValue;
								}

								return pre;
							});
						}
					}}>
					<ChevronLeft className='w-4 h-4 cur' />
				</Button>

				{allowDecimalIncrement && (
					<Button
						size='icon'
						variant='outline'
						onClick={(e) => {
							e.preventDefault();
							if (val > minValue) {
								setVal((prev) => {
									const pre = prev - 0.1;
									if (pre < minValue) {
										return minValue;
									}

									return pre;
								});
							}
						}}>
						<ChevronsLeft className='w-4 h-4 cur' />
					</Button>
				)}
			</div>
			<div className='text-2xl font-bold w-12 text-center'>
				{val % 1 > 0 ? val.toFixed(1) : val}
			</div>
			<div className='flex flex-row items-center gap-2'>
				{allowDecimalIncrement && (
					<Button
						size='icon'
						variant='outline'
						onClick={(e) => {
							e.preventDefault();
							setVal((prev) => {
								const pre = prev + 0.1;
								if (pre > maxValue) {
									return maxValue;
								}
								return pre;
							});
						}}>
						<ChevronsRight className='w-4 h-4' />
					</Button>
				)}

				<Button
					size='icon'
					variant='outline'
					onClick={(e) => {
						e.preventDefault();
						setVal((prev) => {
							const pre = prev + 1;
							if (pre > maxValue) {
								return maxValue;
							}
							return pre;
						});
					}}>
					<ChevronRight className='w-4 h-4' />
				</Button>
			</div>
		</div>
	);
}
