'use client';
import { addKnownCaloriesBurned, createDailyLog } from '@/actions/log-actions';
import { Input } from '../ui/input';
import { useContext, useEffect, useState } from 'react';
import { GetLog } from '@/types';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { FaSpinner } from 'react-icons/fa';
import { toast } from 'sonner';
import { LogUpdateContext } from '@/contexts/log-context';
import { Skeleton } from '../ui/skeleton';
import { useSession } from 'next-auth/react';

export default function KnowCaloriesBurned() {
	const [log, setLog] = useState<GetLog>();
	const [caloriesBurned, setCaloriesBurned] = useState(0);
	const [submitting, setSubmitting] = useState(false);
	const [fetching, setFetching] = useState(true);
	const [inputVal, setInputVal] = useState(0);

	const { data: session } = useSession();
	const logContext = useContext(LogUpdateContext);

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

	if (!session) {
		return null;
	}

	return (
		<div className='border-2 rounded-md p-2 flex flex-col items-center gap-2 text-sm'>
			{fetching ? (
				<Skeleton className='w-44 h-6' />
			) : (
				<div className='h-6'>Known calories burned: {caloriesBurned}</div>
			)}

			<div className='flex flex-row items-center gap-2'>
				<Input
					defaultValue={inputVal}
					onChange={(e) => {
						setInputVal(Number(e.target.value));
					}}
					type='number'
					className='w-32'
				/>
				<Button
					disabled={submitting}
					onClick={async () => {
						setSubmitting(true);
						const res = await addKnownCaloriesBurned(inputVal);

						if (res.success) {
							toast(res.message);
							getLog();

							// upate context so other components know something changed in the log
							if (logContext && logContext.isUpdated) {
								const update = {
									...logContext,
									updated: true
								};
								logContext.isUpdated(update);
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
		</div>
	);
}
