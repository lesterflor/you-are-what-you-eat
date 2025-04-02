'use client';

import { Plus, ShoppingCart } from 'lucide-react';
import { Button } from '../ui/button';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetTitle,
	SheetTrigger
} from '../ui/sheet';
import { MdOutlineLocalGroceryStore } from 'react-icons/md';
import AddGroceryListForm from './add-grocery-list-form';
import { useContext, useEffect, useState } from 'react';
import { GetGroceryList } from '@/types';
import { getGroceryListsByUser } from '@/actions/grocery-actions';
import GroceryListItemCard from './grocery-list-item-card';
import { ScrollArea } from '../ui/scroll-area';
import { UpdateGroceryListContext } from '@/contexts/update-grocery-list-context';
import { FaSpinner } from 'react-icons/fa';

export default function GrocerListSheet() {
	const [sheetOpen, setSheetOpen] = useState(false);
	const [lists, setLists] = useState<GetGroceryList[]>([]);
	const [isFetching, setIsFetching] = useState(true);

	const groceryContext = useContext(UpdateGroceryListContext);

	const fetchLists = async () => {
		setIsFetching(true);
		const res = await getGroceryListsByUser(true);

		if (res.success && res.data) {
			setLists(res.data as GetGroceryList[]);
		}

		setIsFetching(false);
	};

	useEffect(() => {
		fetchLists();
	}, []);

	useEffect(() => {
		if (groceryContext && groceryContext.updated) {
			fetchLists();
		}
	}, [groceryContext]);

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
							<SheetContent className='max-w-[100vw] w-[100vw] h-[95%]'>
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
					<ScrollArea className='w-full portrait:h-[75vh] pr-2'>
						{isFetching ? (
							<div className='w-full h-full flex flex-col items-center justify-center'>
								<FaSpinner className='w-36 h-36 animate-spin opacity-10' />
							</div>
						) : (
							<>
								<div className='w-full flex flex-col gap-6 pb-2'>
									{lists.length > 0 ? (
										lists.map((item) => (
											<GroceryListItemCard
												key={item.id}
												list={item}
												onComplete={() => {
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
