'use client';

import { cn } from '@/lib/utils';
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import IncrementButton from './increment-button';

export default function NumberIncrementor({
	value = 0,
	onChange,
	minValue = 0,
	maxValue = Infinity,
	allowDecimalIncrement = true,
	compactMode = false,
	children,
	allowLongPress = true
}: {
	value?: number;
	onChange: (val: number) => void;
	minValue?: number;
	allowDecimalIncrement?: boolean;
	maxValue?: number;
	compactMode?: boolean;
	children?: React.ReactNode;
	allowLongPress?: boolean;
}) {
	const [val, setVal] = useState(value);

	useEffect(() => {
		onChange(Number(val % 1 > 0 ? val.toFixed(1) : val));
	}, [val]);

	return (
		<div className='flex flex-col items-center gap-1'>
			<div>{children}</div>
			<div
				className={cn(
					'flex flex-row items-center justify-start rounded-md border-2 p-1 select-none',
					compactMode ? 'gap-1' : 'gap-2'
				)}>
				<div
					className={cn(
						'flex flex-row items-center gap-2',
						compactMode && 'gap-1'
					)}>
					<IncrementButton
						dataTestId='decrement-button'
						allowLongPress={allowLongPress}
						increment={-1}
						onChange={(rVal) => {
							if (val > minValue) {
								setVal((prev) => {
									const pre = prev + rVal;
									if (pre < minValue) {
										return minValue;
									}

									return pre;
								});
							}
						}}>
						<ChevronLeft className='w-4 h-4' />
					</IncrementButton>

					{allowDecimalIncrement && (
						<IncrementButton
							allowLongPress={allowLongPress}
							increment={-0.1}
							onChange={(rVal) => {
								if (val > minValue) {
									setVal((prev) => {
										const pre = prev + rVal;
										if (pre < minValue) {
											return minValue;
										}

										return pre;
									});
								}
							}}>
							<ChevronsLeft className='w-4 h-4' />
						</IncrementButton>
					)}
				</div>
				<div
					data-testid='current-value'
					className={cn(
						'text-2xl font-bold w-12 text-center',
						compactMode && 'text-lg w-7'
					)}>
					{val % 1 > 0 ? val.toFixed(1) : val}
				</div>
				<div
					className={cn(
						'flex flex-row items-center gap-2',
						compactMode && 'gap-1'
					)}>
					{allowDecimalIncrement && (
						<IncrementButton
							allowLongPress={allowLongPress}
							increment={0.1}
							onChange={(rVal) => {
								setVal((prev) => {
									const pre = prev + rVal;
									if (pre > maxValue) {
										return maxValue;
									}
									return pre;
								});
							}}>
							<ChevronsRight className='w-4 h-4' />
						</IncrementButton>
					)}

					<IncrementButton
						dataTestId='increment-button'
						allowLongPress={allowLongPress}
						increment={1}
						onChange={(rVal) => {
							setVal((prev) => {
								const pre = prev + rVal;
								if (pre > maxValue) {
									return maxValue;
								}
								return pre;
							});
						}}>
						<ChevronRight className='w-4 h-4' />
					</IncrementButton>
				</div>
			</div>
		</div>
	);
}
