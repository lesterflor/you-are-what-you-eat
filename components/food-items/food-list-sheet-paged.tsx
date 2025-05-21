'use client';

import { getAllFoodItemsPaged } from '@/actions/food-actions';
import { cn } from '@/lib/utils';
import { GetFoodItem } from '@/types';
import { Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ImSpinner2 } from 'react-icons/im';
import { useInView } from 'react-intersection-observer';
import DishCreationPopover from '../dish/dish-creation-popover';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetTitle,
	SheetTrigger
} from '../ui/sheet';
import FoodItemCard from './food-item-card';

export default function FoodListSheetPaged({
	children
}: {
	children?: React.ReactNode;
}) {
	const [foods, setFoods] = useState<GetFoodItem[]>([]);
	const [currentPage, setCurrentPage] = useState(0);
	const [currentCursorId, setCurrentCursorId] = useState('');
	const [isFetching, setIsFetching] = useState(false);
	const [ref, inView] = useInView();

	useEffect(() => {
		if (inView) {
			setCurrentPage((prev) => prev + 1);
			console.log('last item inView? ', inView);
		}
	}, [inView]);

	const scrollAreaRef = useRef<HTMLDivElement>(null);

	// const scrollToTop = () => {
	// 	if (scrollAreaRef.current) {
	// 		scrollAreaRef.current.scrollIntoView({
	// 			behavior: 'smooth',
	// 			block: 'start'
	// 		});
	// 	}
	// };

	const fetchItems = async () => {
		setIsFetching(true);
		console.log(
			`currentPage: ${currentPage} - currentCursorId: ${currentCursorId}`
		);

		const res = await getAllFoodItemsPaged(currentPage, currentCursorId);

		if (res.success && res.data) {
			if (currentPage === 0) {
				setFoods(res.data as GetFoodItem[]);
			} else {
				const clone = [...foods];
				const merged = clone.concat(res.data as GetFoodItem[]);

				merged.sort((a, b) => a.name.localeCompare(b.name));

				setFoods(merged);
			}

			setCurrentCursorId(res.lastCursor);
		}

		setIsFetching(false);
	};

	useEffect(() => {
		fetchItems();
	}, [currentPage]);

	useEffect(() => {
		//scrollToTop();
		console.log(JSON.stringify(foods));
	}, [foods]);

	// useEffect(() => {
	// 	if (foodUpdateStatus !== 'idle') {
	// 		getFoods();
	// 	}
	// }, [foodUpdateData, foodUpdateStatus]);

	return (
		<div>
			<Sheet>
				<SheetTrigger asChild>
					{children ? (
						children
					) : (
						<Button>
							<Search className='w-4 h-4' /> Search
						</Button>
					)}
				</SheetTrigger>
				<SheetContent
					side='top'
					className='px-2'>
					<SheetDescription></SheetDescription>
					<SheetTitle className='flex flex-col items-center gap-2 pb-4'>
						<div className='flex flex-row gap-2 justify-between items-center pt-2'>
							<DishCreationPopover />
						</div>

						{/* <FoodCategoryPicker
							value='favourites'
							showFilterIcon={true}
							iconsOnly={true}
							onSelect={() => {}}
							compactMode={true}
						/> */}
					</SheetTitle>
					<ScrollArea className='h-[70vh] w-[100%]'>
						<div
							ref={scrollAreaRef}
							className={cn(
								'gap-4 pb-5 w-[97%] flex flex-col items-center justify-center'
							)}>
							{foods && foods.length > 0 ? (
								<>
									{foods.map((item, indx) => (
										<FoodItemCard
											indx={indx}
											item={item as GetFoodItem}
											key={item.id}
											selfSearch={true}
										/>
									))}
									{isFetching && (
										<div>
											<ImSpinner2 className='animate-spin w-6 h-6 opacity-25' />
										</div>
									)}
									<div
										className='w-52 h-4'
										ref={ref}></div>
								</>
							) : (
								<div className='w-full text-center text-muted-foreground font-normal'>
									There are no results for the search you provided.
								</div>
							)}
						</div>
					</ScrollArea>
				</SheetContent>
			</Sheet>
		</div>
	);
}
