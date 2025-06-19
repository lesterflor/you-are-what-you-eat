'use client';
import {
	addKnownCaloriesBurned,
	getKnownCaloriesBurned
} from '@/actions/log-actions';
import { useCurrentSession } from '@/hooks/use-current-session';
import { expendedCaloriesUpdated } from '@/lib/features/log/logFoodSlice';
import { useAppDispatch } from '@/lib/hooks';
import { Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ImSpinner2 } from 'react-icons/im';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export default function KnowCaloriesBurned() {
	const dispatch = useAppDispatch();

	const [caloriesBurned, setCaloriesBurned] = useState(0);
	const [submitting, setSubmitting] = useState(false);
	const [fetching, setFetching] = useState(true);
	const [inputVal, setInputVal] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);

	const { status } = useCurrentSession();

	const fetchKDC = async () => {
		setFetching(true);
		const res = await getKnownCaloriesBurned();

		if (res?.success && res.data) {
			setCaloriesBurned(res.data.calories);
		}

		setFetching(false);
	};

	useEffect(() => {
		fetchKDC();
	}, []);

	if (status !== 'authenticated') {
		return null;
	}

	return (
		<div className='border-2 rounded-md p-2 flex flex-col items-center gap-2 text-sm'>
			<div className='h-6 flex flex-row items-center'>
				<span className='pr-2'>Calories Expended:</span>
				{fetching ? (
					<span className='flex flex-col items-center justify-center text-amber-400 w-10'>
						<ImSpinner2 className='w-4 h-4 animate-spin' />
					</span>
				) : (
					<span className='text-amber-400 w-10 text-center'>
						{caloriesBurned}
					</span>
				)}
			</div>

			<div className='flex flex-row items-center justify-between gap-2 w-full'>
				<Input
					ref={inputRef}
					onChange={(e) => {
						setInputVal(Number(e.target.value));
					}}
					type='number'
					maxLength={4}
					className='w-20 text-lg'
				/>
				<Button
					disabled={submitting}
					onClick={async () => {
						setSubmitting(true);
						const res = await addKnownCaloriesBurned(inputVal);

						if (res.success && res.data) {
							toast.success(res.message);

							setCaloriesBurned(res.data.calories);

							// redux
							dispatch(expendedCaloriesUpdated(inputVal));

							if (inputRef.current) {
								inputRef.current.value = '';
							}
						} else {
							toast.error(res.message);
						}

						setSubmitting(false);
					}}>
					{submitting ? (
						<ImSpinner2 className='w-4 h-4 animate-spin' />
					) : (
						<Plus className='h-4 w-4' />
					)}
					{submitting ? 'Adding...' : 'Add'}
				</Button>
			</div>

			<div className='text-muted-foreground text-xs'>
				* If you are aware of calories you have burned outside your BMR (Base
				Metabolic Rate), enter it here. You can add more at any time to keep
				adding to the calories you have burned throughout the day.
			</div>
		</div>
	);
}
