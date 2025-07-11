'use client';

import { getGroceryListsByUser } from '@/actions/grocery-actions';
import { selectGroceryStatus } from '@/lib/features/grocery/grocerySlice';
import { useAppSelector } from '@/lib/hooks';
import { GetGroceryList } from '@/types';
import { Plus, ShoppingCart } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { ImSpinner2 } from 'react-icons/im';
import { MdOutlineLocalGroceryStore } from 'react-icons/md';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetTitle,
	SheetTrigger
} from '../ui/sheet';
import AddGroceryListForm from './add-grocery-list-form';
import GroceryListItemCard from './grocery-list-item-card';

export default function GrocerListSheet() {
	const [sheetOpen, setSheetOpen] = useState(false);
	const [lists, setLists] = useState<GetGroceryList[]>([]);
	const [isFetching, setIsFetching] = useTransition();

	const groceryListStateStatus = useAppSelector(selectGroceryStatus);

	const fetchLists = () => {
		setIsFetching(async () => {
			const res = await getGroceryListsByUser(true);

			if (res.success && res.data) {
				setIsFetching(() => {
					setLists(res.data as GetGroceryList[]);
				});
			}
		});
	};

	useEffect(() => {
		fetchLists();
	}, []);

	useEffect(() => {
		if (
			groceryListStateStatus === 'addedList' ||
			groceryListStateStatus === 'updatedList' ||
			groceryListStateStatus === 'completedList'
		) {
			fetchLists();
		}
	}, [groceryListStateStatus]);

	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button className='w-32'>
					<MdOutlineLocalGroceryStore className='h-4 w-4' />
					Grocery Lists
				</Button>
			</SheetTrigger>
			<SheetContent
				side='top'
				className='portrait:max-w-[100vw] w-[100vw]'>
				<SheetDescription></SheetDescription>
				<SheetTitle className='flex flex-row items-center gap-1 justify-between pt-5'>
					<div className='flex flex-row gap-1 items-center'>
						<MdOutlineLocalGroceryStore className='h-6 w-6' /> My Grocery Lists
					</div>
					<div>
						<Sheet
							open={sheetOpen}
							onOpenChange={setSheetOpen}>
							<SheetTrigger asChild>
								<Button>
									<Plus className='w-4 h-4' />
									New
								</Button>
							</SheetTrigger>
							<SheetContent
								className='max-w-[100vw] w-[100vw]'
								side={'bottom'}>
								<SheetTitle className='text-lg flex flex-row items-center justify-between  text-muted-foreground border-b-2 pb-2 w-full pr-5'>
									<div className='flex flex-row items-center gap-2'>
										<Plus className='w-4 h-4' />
										New List
									</div>
								</SheetTitle>
								<SheetDescription></SheetDescription>

								<AddGroceryListForm
									onSuccess={() => {
										setSheetOpen(false);
										fetchLists();
									}}
								/>
							</SheetContent>
						</Sheet>
					</div>
				</SheetTitle>

				<div className='flex flex-col items-center justify-between gap-4 w-full mt-5'>
					<ScrollArea className='w-full pr-2'>
						{isFetching ? (
							<div className='w-full h-full flex flex-col items-center justify-center'>
								<ImSpinner2 className='w-24 h-24 animate-spin opacity-10' />
							</div>
						) : (
							<>
								<div className='w-full flex flex-col gap-6 pb-2 max-h-[70vh]'>
									{lists.length > 0 ? (
										lists.map((item) => (
											<GroceryListItemCard
												key={item.id}
												list={item}
												onComplete={() => {
													fetchLists();
												}}
												onClose={() => {
													fetchLists();
												}}
											/>
										))
									) : (
										<div className='w-full flex flex-col items-center justify-center'>
											<ShoppingCart className='w-60 h-60 opacity-5' />
										</div>
									)}
								</div>
							</>
						)}
					</ScrollArea>
				</div>
			</SheetContent>
		</Sheet>
	);
}
