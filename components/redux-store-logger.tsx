'use client';

import {
	selectPreparedDishData,
	selectPreparedDishMsg,
	selectPreparedDishStatus
} from '@/lib/features/dish/preparedDishSlice';
import {
	selectBookmarkFoodData,
	selectBookmarkFoodMessage,
	selectBookmarkFoodStatus
} from '@/lib/features/food/bookmarkSlice';
import {
	selectFoodSearchData,
	selectFoodSearchStatus
} from '@/lib/features/food/foodSearchSlice';
import {
	selectFoodUpdateData,
	selectFoodUpdateMsg,
	selectFoodUpdateStatus
} from '@/lib/features/food/foodUpdateSlice';
import {
	selectGroceryData,
	selectGroceryMsg,
	selectGroceryStatus
} from '@/lib/features/grocery/grocerySlice';
import { selectData, selectStatus } from '@/lib/features/log/logFoodSlice';
import {
	selectWaterLogData,
	selectWaterLogMessage,
	selectWaterLogStatus
} from '@/lib/features/log/waterLogSlice';
import {
	selectNoteMsg,
	selectNoteUpdateData,
	selectNoteUpdateStatus
} from '@/lib/features/notes/noteUpdateSlice';
import { useAppSelector } from '@/lib/hooks';
import { logActivityMutationOptions } from '@/lib/mutations/logMutations';
import { getCurrentActivityLogQueryOptions } from '@/lib/queries/logQueries';
import { cn } from '@/lib/utils';
import { ActivityItem, GetUser } from '@/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Activity, SquareActivity } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { ImSpinner2 } from 'react-icons/im';
import ActivityCard from './activity/activity-card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { ScrollArea } from './ui/scroll-area';

export default function ReduxStoreLogger({
	enable = true
}: {
	enable?: boolean;
}) {
	const { data: session } = useSession();
	const user = session?.user as GetUser;

	const [hasOpened, setHasOpened] = useState(false);

	const logFoodItem = useAppSelector(selectData);
	const logFoodItemStatus = useAppSelector(selectStatus);

	const dishStateData = useAppSelector(selectPreparedDishData);
	const dishStateStatus = useAppSelector(selectPreparedDishStatus);
	const dishStateMsg = useAppSelector(selectPreparedDishMsg);

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

	const waterLogData = useAppSelector(selectWaterLogData);
	const waterLogStatus = useAppSelector(selectWaterLogStatus);
	const waterLogMessage = useAppSelector(selectWaterLogMessage);

	const bookmarkFoodData = useAppSelector(selectBookmarkFoodData);
	const bookmarkFoodStatus = useAppSelector(selectBookmarkFoodStatus);
	const bookmarkFoodMsg = useAppSelector(selectBookmarkFoodMessage);

	const { data: activityLog, isFetching } = useQuery(
		getCurrentActivityLogQueryOptions()
	);

	const { mutate: logActivity } = useMutation(logActivityMutationOptions());

	const logActivityAction = (data: ActivityItem) => {
		logActivity(data);
	};

	useEffect(() => {
		if (
			logFoodItemStatus === 'added' ||
			logFoodItemStatus === 'updated' ||
			logFoodItemStatus === 'deleted' ||
			logFoodItemStatus === 'loggedCalories' ||
			logFoodItemStatus === 'expended calories' ||
			logFoodItemStatus === 'loggedDish'
		) {
			const data = {
				type: 'logFood',
				action: logFoodItemStatus,
				data: logFoodItem.message
			};

			logActivityAction(data);

			setHasOpened(false);
		}
	}, [logFoodItem, logFoodItemStatus]);

	useEffect(() => {
		if (waterLogStatus === 'updated') {
			const data = {
				type: 'waterLog',
				action: waterLogStatus,
				data: waterLogMessage
			};

			logActivityAction(data);

			setHasOpened(false);
		}
	}, [waterLogData, waterLogStatus, waterLogMessage]);

	useEffect(() => {
		if (bookmarkFoodStatus !== 'idle') {
			const data = {
				type: 'bookmarkFood',
				action: bookmarkFoodStatus,
				data: bookmarkFoodMsg
			};

			logActivityAction(data);

			setHasOpened(false);
		}
	}, [bookmarkFoodData, bookmarkFoodStatus, bookmarkFoodMsg]);

	useEffect(() => {
		if (
			dishStateStatus === 'added' ||
			dishStateStatus === 'updated' ||
			dishStateStatus === 'deleted' ||
			dishStateStatus === 'logged'
		) {
			const data = {
				type: 'dishData',
				action: dishStateStatus,
				data: dishStateMsg
			};

			logActivityAction(data);

			setHasOpened(false);
		}
	}, [dishStateData, dishStateStatus, dishStateMsg]);

	useEffect(() => {
		if (foodSliceStatus !== 'idle') {
			const data = {
				type: 'foodData',
				action: foodSliceStatus,
				data: foodSliceMsg
			};

			logActivityAction(data);

			setHasOpened(false);
		}
	}, [foodSliceData, foodSliceStatus, foodSliceMsg]);

	useEffect(() => {
		if (foodSearchStatus !== 'idle' && foodSearchStatus !== 'all') {
			const data = {
				type: 'foodSearch',
				action: foodSearchStatus,
				data: foodSearchData.message
			};

			logActivityAction(data);

			setHasOpened(false);
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

			setHasOpened(false);
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

			setHasOpened(false);
		}
	}, [groceryData, groceryStatus, groceryMsg]);

	if (!enable) {
		return null;
	}

	return (
		<>
			{isFetching ? (
				<Button
					variant='outline'
					className='w-14'>
					<ImSpinner2 className='animate-spin opacity-50' />
				</Button>
			) : user && activityLog && activityLog.activityItems.length > 0 ? (
				<Popover>
					<PopoverTrigger asChild>
						<Button
							onClick={() => {
								setHasOpened(true);
							}}
							className='px-2'
							variant='outline'
							size='sm'>
							<Avatar className='w-4 h-4'>
								<AvatarImage src={user.image} />
								<AvatarFallback className='text-xs opacity-40'>
									{user.name.slice(0, 1)}
								</AvatarFallback>
							</Avatar>
							<SquareActivity
								className={cn(
									'w-4 h-4 animate-pulse',
									!hasOpened && 'text-red-600'
								)}
							/>
						</Button>
					</PopoverTrigger>
					<PopoverContent className='flex flex-col gap-2'>
						<div className='flex flex-row items-center gap-1'>
							<Activity className='w-4 h-4 animate-pulse' /> Activity
						</div>
						<ScrollArea
							className={cn(
								'w-full h-[20%]',
								activityLog.activityItems.length < 5 ? 'h-auto' : 'h-[45vh]'
							)}>
							<div className='flex flex-col gap-2'>
								{activityLog.activityItems.map((item) => (
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
