'use client';

import {
	getCurrentActivityLog,
	logActivity
} from '@/actions/activity-log-actions';
import {
	selectFoodSearchData,
	selectFoodSearchStatus
} from '@/lib/features/food/foodSearchSlice';
import {
	selectFoodUpdateData,
	selectFoodUpdateMsg,
	selectFoodUpdateStatus
} from '@/lib/features/food/foodUpdateSlice';
import { selectData, selectStatus } from '@/lib/features/log/logFoodSlice';
import {
	selectNoteMsg,
	selectNoteUpdateData,
	selectNoteUpdateStatus
} from '@/lib/features/notes/noteUpdateSlice';
import { useAppSelector } from '@/lib/hooks';
import {
	ActivityItem,
	GetActivityItem,
	GetActivityLog,
	GetUser
} from '@/types';
import { useEffect, useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { useSession } from 'next-auth/react';
import { Activity, SquareActivity } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import ActivityCard from './activity/activity-card';
import {
	selectGroceryData,
	selectGroceryMsg,
	selectGroceryStatus
} from '@/lib/features/grocery/grocerySlice';

export default function ReduxStoreLogger({
	enable = true
}: {
	enable?: boolean;
}) {
	const { data: session } = useSession();
	const user = session?.user as GetUser;

	const logFoodItem = useAppSelector(selectData);
	const logFoodItemStatus = useAppSelector(selectStatus);

	const foodSliceData = useAppSelector(selectFoodUpdateData);
	const foodSliceStatus = useAppSelector(selectFoodUpdateStatus);
	const foodSliceMsg = useAppSelector(selectFoodUpdateMsg);

	const foodSearchData = useAppSelector(selectFoodSearchData);
	const foodSearchStatus = useAppSelector(selectFoodSearchStatus);

	const noteData = useAppSelector(selectNoteUpdateData);
	const noteStatus = useAppSelector(selectNoteUpdateStatus);
	const noteMsg = useAppSelector(selectNoteMsg);

	const groceryData = useAppSelector(selectGroceryData);
	const groceryStatus = useAppSelector(selectGroceryStatus);
	const groceryMsg = useAppSelector(selectGroceryMsg);

	const [isFetching, setIsFetching] = useState(false);
	const [log, setLog] = useState<GetActivityLog>();
	const [activities, setActivities] = useState<GetActivityItem[]>([]);

	const getTodaysActivity = async () => {
		setIsFetching(true);
		const res = await getCurrentActivityLog();

		if (res.success && res.data) {
			setLog(res.data);
		}
		setIsFetching(false);
	};

	const logActivityAction = async (data: ActivityItem) => {
		setIsFetching(true);
		const res = await logActivity(data);

		if (res.success) {
			getTodaysActivity();
		}

		setIsFetching(false);
	};

	useEffect(() => {
		getTodaysActivity();
	}, []);

	useEffect(() => {
		if (log?.activityItems) {
			setActivities(
				log.activityItems.sort(
					(a, b) => b.createdAt.getTime() - a.createdAt.getTime()
				)
			);
		}
	}, [log]);

	useEffect(() => {
		if (logFoodItemStatus !== 'idle') {
			const data = {
				type: 'logFood',
				action: logFoodItemStatus,
				data: logFoodItem.message
			};

			logActivityAction(data);
		}
	}, [logFoodItem, logFoodItemStatus]);

	useEffect(() => {
		if (foodSliceStatus !== 'idle') {
			const data = {
				type: 'foodData',
				action: foodSliceStatus,
				data: foodSliceMsg
			};

			logActivityAction(data);
		}
	}, [foodSliceData, foodSliceStatus, foodSliceMsg]);

	useEffect(() => {
		if (foodSearchStatus !== 'idle') {
			const data = {
				type: 'foodSearch',
				action: foodSearchStatus,
				data: foodSearchData.message
			};

			logActivityAction(data);
		}
	}, [foodSearchData, foodSearchStatus]);

	useEffect(() => {
		if (noteStatus !== 'idle') {
			const data = {
				type: 'noteData',
				action: noteStatus,
				data: noteMsg
			};

			logActivityAction(data);
		}
	}, [noteData, noteStatus, noteMsg]);

	useEffect(() => {
		if (groceryStatus !== 'idle') {
			const data = {
				type: 'groceryData',
				action: groceryStatus,
				data: groceryMsg
			};
			logActivityAction(data);
		}
	}, [groceryData, groceryStatus, groceryMsg]);

	if (!enable || !user) {
		return null;
	}

	return (
		<>
			{isFetching ? (
				<div>
					<FaSpinner className='w-4 h-4 animate-spin' />
				</div>
			) : activities.length > 0 ? (
				<Popover>
					<PopoverTrigger asChild>
						<Button
							className='px-2'
							variant='outline'
							size='sm'>
							<Avatar className='w-4 h-4'>
								<AvatarImage src={user.image} />
								<AvatarFallback>{user.name.slice(0, 1)}</AvatarFallback>
							</Avatar>
							<SquareActivity className='w-4 h-4' />
						</Button>
					</PopoverTrigger>
					<PopoverContent className='flex flex-col gap-2'>
						<div className='flex flex-row items-center gap-1'>
							<Activity className='w-4 h-4' /> Activity
						</div>
						<ScrollArea
							className={cn(
								'w-full h-[20%]',
								activities.length < 5 ? 'h-auto' : 'h-[45vh]'
							)}>
							<div className='flex flex-col gap-2'>
								{activities.map((item) => (
									<ActivityCard
										item={item}
										key={item.id}
									/>
								))}
							</div>
						</ScrollArea>
					</PopoverContent>
				</Popover>
			) : (
				''
			)}
		</>
	);
}
