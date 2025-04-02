'use client';

import { GetGroceryItem } from '@/types';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Check, XIcon } from 'lucide-react';
import { useState } from 'react';
import { updateGroceryItem } from '@/actions/grocery-actions';
import { toast } from 'sonner';
import { FaSpinner } from 'react-icons/fa';
import { cn } from '@/lib/utils';

export default function GroceryItemCard({
	item,
	displayOnly = false,
	enableRemove = false,
	onRemove,
	listId,
	onChange
}: {
	item: GetGroceryItem;
	displayOnly?: boolean;
	enableRemove?: boolean;
	onRemove?: (item: GetGroceryItem) => void;
	onChange?: () => void;
	listId?: string;
}) {
	const [updating, setUpdating] = useState(false);
	const [groceryItem, setGroceryItem] = useState<GetGroceryItem>(item);

	const updateItemStatus = async () => {
		setUpdating(true);

		item.status = 'completed';
		const res = await updateGroceryItem(item);

		if (res.success && res.data) {
			toast.success(res.message);
			setGroceryItem(res.data);
			onChange?.();
		} else {
			toast.error(res.message);
		}

		setUpdating(false);
	};

	const unlinkItemFromList = async () => {
		setUpdating(true);

		if (listId) {
			groceryItem.groceryListId = null;
		}

		const res = await updateGroceryItem(groceryItem);

		if (res.success && res.data) {
			toast.success(res.message);
			setGroceryItem(res.data);
			onChange?.();
		} else {
			toast.error(res.message);
		}

		setUpdating(false);
	};

	return (
		<div className='flex flex-row items-center justify-between gap-2 w-full'>
			<div className='flex flex-col gap-1'>
				<div className='flex flex-row items-center gap-2'>
					<Badge
						className='text-xl rounded-full'
						variant={
							groceryItem.status === 'pending' ? 'destructive' : 'default'
						}>
						{groceryItem.qty}
					</Badge>
					<div
						className={cn(
							'capitalize text-xl',
							groceryItem.status === 'completed' &&
								'line-through text-muted-foreground'
						)}>
						{groceryItem.name}
					</div>
				</div>

				<div className='text-xs text-muted-foreground leading-tight'>
					{groceryItem.description}
				</div>
			</div>

			{!displayOnly && (
				<div>
					{groceryItem.status === 'pending' ? (
						<Button
							disabled={updating}
							onClick={(e) => {
								e.preventDefault();
								updateItemStatus();
							}}
							variant='outline'
							size='lg'>
							{updating ? (
								<FaSpinner className='w-8 h-8 animate-spin' />
							) : (
								<Check className='w-8 h-8' />
							)}
						</Button>
					) : (
						<Check className='w-8 h-8 text-green-600' />
					)}
				</div>
			)}

			{enableRemove && (
				<div>
					<Button
						onClick={(e) => {
							e.preventDefault();
							onRemove?.(groceryItem);

							if (listId) {
								unlinkItemFromList();
							}
						}}
						size='icon'
						variant='outline'>
						<XIcon />
					</Button>
				</div>
			)}
		</div>
	);
}
