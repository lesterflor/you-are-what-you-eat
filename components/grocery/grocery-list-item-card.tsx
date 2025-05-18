'use client';

import { updateGroceryList } from '@/actions/grocery-actions';
import { completeGroceryListState } from '@/lib/features/grocery/grocerySlice';
import { useAppDispatch } from '@/lib/hooks';
import { GetGroceryList } from '@/types';
import { format } from 'date-fns';
import { Check, PenLineIcon } from 'lucide-react';
import { useState } from 'react';
import { ImSpinner2 } from 'react-icons/im';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger
} from '../ui/dialog';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetTitle,
	SheetTrigger
} from '../ui/sheet';
import GroceryItemCard from './grocery-item-card';
import SharedListAvatars from './shared-list-avatars';
import UpdateGroceryListForm from './update-grocery-list-form';

export default function GroceryListItemCard({
	list,
	onComplete,
	onEdit
}: {
	list: GetGroceryList;
	onComplete?: () => void;
	onEdit?: (item: GetGroceryList) => void;
}) {
	const dispatch = useAppDispatch();

	const [isUpdating, setIsUpdating] = useState(false);
	const [grList, setGrList] = useState<GetGroceryList>(list);
	const [listComplete, setListComplete] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editSheetOpen, setEditSheetOpen] = useState(false);

	const updateListStatus = async () => {
		setIsUpdating(true);

		grList.status = 'completed';
		const res = await updateGroceryList(grList);

		if (res.success && res.data) {
			setGrList(res.data);

			toast.success(res.message);

			setListComplete(true);

			onComplete?.();

			setDialogOpen(false);

			// redux
			dispatch(completeGroceryListState(JSON.stringify(res.data)));
		} else {
			toast.error(res.message);
		}

		setIsUpdating(false);
	};

	return (
		<Card className='p-2'>
			<CardHeader className='p-0 relative'>
				<div className='text-xs text-muted-foreground flex flex-row justify-between items-center pr-5'>
					<div className='w-fit'>{format(grList.createdAt, 'PPP h:mm a')}</div>
					<SharedListAvatars userIds={grList.sharedUsers} />
				</div>
			</CardHeader>
			<CardContent className='p-0 flex flex-col gap-2'>
				<div className='flex flex-col gap-5'>
					{grList.groceryItems &&
						grList.groceryItems.length > 0 &&
						grList.groceryItems.map((gr) => (
							<GroceryItemCard
								key={gr.id}
								item={gr}
							/>
						))}
				</div>
			</CardContent>

			{!listComplete && (
				<CardFooter className='p-0 pt-6 flex flex-row items-center justify-between'>
					<Sheet
						open={editSheetOpen}
						onOpenChange={setEditSheetOpen}>
						<SheetTrigger asChild>
							<Button>
								<PenLineIcon />
								Edit List
							</Button>
						</SheetTrigger>
						<SheetContent
							side='left'
							className='portrait:max-w-[100vw] portrait:w-[100vw] h-[95%] portrait:h-auto'>
							<SheetTitle className='text-lg flex flex-row items-center justify-between  text-muted-foreground border-b-2 pb-2 w-full pr-5'>
								Edit List
							</SheetTitle>
							<SheetDescription></SheetDescription>
							<UpdateGroceryListForm
								list={grList}
								onSuccess={(item) => {
									onEdit?.(item as GetGroceryList);
									setEditSheetOpen(false);
								}}
							/>
						</SheetContent>
					</Sheet>

					<Dialog
						open={dialogOpen}
						onOpenChange={setDialogOpen}>
						<DialogTrigger asChild>
							<Button>
								<Check className='h-4 w-4' /> Complete List ?
							</Button>
						</DialogTrigger>
						<DialogContent className='flex flex-col gap-4 items-center justify-center portrait:w-[75vw] rounded-md'>
							<DialogTitle>Confirm complete?</DialogTitle>
							<Button
								disabled={isUpdating}
								onClick={(e) => {
									e.preventDefault();

									if (!listComplete) {
										updateListStatus();
									}
								}}>
								{isUpdating ? (
									<ImSpinner2 className='w-4 h-4 animate-spin' />
								) : (
									<Check className='h-4 w-4' />
								)}
								Complete
							</Button>
						</DialogContent>
					</Dialog>
				</CardFooter>
			)}
		</Card>
	);
}
