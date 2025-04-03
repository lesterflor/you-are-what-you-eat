'use client';
import { addKnownCaloriesBurned, createDailyLog } from '@/actions/log-actions';
import { Input } from '../ui/input';
import { useEffect, useRef, useState } from 'react';
import { GetLog } from '@/types';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { FaSpinner } from 'react-icons/fa';
import { toast } from 'sonner';
import { Skeleton } from '../ui/skeleton';
import { useCurrentSession } from '@/hooks/use-current-session';
import { useAppDispatch } from '@/lib/hooks';
import { expendedCaloriesUpdated } from '@/lib/features/log/logFoodSlice';

export default function KnowCaloriesBurned() {
	const dispatch = useAppDispatch();

	const [log, setLog] = useState<GetLog>();
	const [caloriesBurned, setCaloriesBurned] = useState(0);
	const [submitting, setSubmitting] = useState(false);
	const [fetching, setFetching] = useState(true);
	const [inputVal, setInputVal] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);

	const { status } = useCurrentSession();

	const getLog = async () => {
		const res = await createDailyLog();

		if (res?.success && res.data) {
			setLog(res.data as GetLog);
		}

		setFetching(false);
	};

	useEffect(() => {
		setFetching(true);
		getLog();
	}, []);

	useEffect(() => {
		if (log?.knownCaloriesBurned && log.knownCaloriesBurned.length > 0) {
			setCaloriesBurned(log.knownCaloriesBurned[0].calories);
		}
	}, [log]);

	if (status !== 'authenticated') {
		return null;
	}

	return (
		<div className='border-2 rounded-md p-2 flex flex-col items-center gap-2 text-sm'>
			{fetching ? (
				<Skeleton className='w-44 h-6' />
			) : (
				<div className='h-6'>Known calories burned: {caloriesBurned}</div>
			)}

			<div className='flex flex-row items-center justify-between gap-2 w-full'>
				<Input
					ref={inputRef}
					onChange={(e) => {
						setInputVal(Number(e.target.value));
					}}
					type='number'
					className='w-16'
				/>
				<Button
					disabled={submitting}
					onClick={async () => {
						setSubmitting(true);
						const res = await addKnownCaloriesBurned(inputVal);

						if (res.success) {
							toast.success(res.message);
							getLog();

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
						<FaSpinner className='w-4 h-4 animate-spin' />
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
