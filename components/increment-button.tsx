'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { useLongPress } from '@uidotdev/usehooks';

export default function IncrementButton({
	children,
	increment = 1,
	onChange,
	allowLongPress = true
}: {
	children: React.ReactNode;
	increment: number;
	onChange?: (data: number) => void;
	allowLongPress?: boolean;
}) {
	const [val, setVal] = useState(0);
	const incRef: { current: NodeJS.Timeout | null } = useRef(null);

	useEffect(() => {
		if (val !== 0) {
			onChange?.(increment);
		}
	}, [val]);

	const handleLongPress = (exec: boolean) => {
		if (exec) {
			incRef.current = setInterval(() => {
				setVal((prev) => prev + increment);
			}, 100);
		} else {
			if (incRef.current) {
				clearInterval(incRef.current);
			}
		}
	};

	const attrs = useLongPress(
		(e) => {
			e.preventDefault();
			if (allowLongPress) {
				handleLongPress(true);
			}
		},
		{
			onStart: (e) => {
				e.preventDefault();
				setVal((prev) => prev + increment);
			},
			onFinish: (event) => {
				event.preventDefault();
				handleLongPress(false);
			},
			onCancel: (event) => {
				event.preventDefault();
				handleLongPress(false);
			},
			threshold: 500
		}
	);

	return (
		<Button
			size='icon'
			variant='outline'
			id='intUp'
			onClick={(e) => e.preventDefault()}
			{...attrs}>
			{children}
		</Button>
	);
}
