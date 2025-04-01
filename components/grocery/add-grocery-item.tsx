'use client';

import { GetGroceryItem, GroceryItem, GroceryListStatus } from '@/types';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useState } from 'react';
import NumberIncrementor from '../number-incrementor';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';
import { createGroceryItem } from '@/actions/grocery-actions';
import { toast } from 'sonner';
import { FaSpinner } from 'react-icons/fa';

export default function AddGroceryItem({
	onAdd
}: {
	onAdd: (item: GetGroceryItem) => void;
}) {
	const [name, setName] = useState('');
	const [desc, setDesc] = useState('');
	const [qty, setQty] = useState(1);
	const [stat] = useState<GroceryListStatus>('pending');
	const [submitting, setSubmitting] = useState(false);

	const addNewGroceryItem = async () => {
		setSubmitting(true);
		const newItem: GroceryItem = {
			status: stat,
			name,
			description: desc,
			qty
		};
		const res = await createGroceryItem(newItem);

		if (res.success && res.data) {
			toast.success(res.message);
			onAdd(res.data);
		} else {
			toast.error(res.message);
		}

		setSubmitting(false);
	};

	return (
		<div className='w-full flex flex-row items-center justify-between'>
			<div className='flex flex-col gap-1'>
				<div>
					<Input
						onChange={(e) => {
							setName(e.target.value);
						}}
					/>
				</div>
				<div>
					<Textarea
						onChange={(e) => {
							setDesc(e.target.value);
						}}
					/>
				</div>
			</div>

			<div>
				<NumberIncrementor onChange={(value) => setQty(value)}>
					Quantity
				</NumberIncrementor>
			</div>

			<div>
				<Button
					disabled={submitting}
					onClick={(e) => {
						e.preventDefault();
						addNewGroceryItem();
					}}>
					{submitting ? (
						<FaSpinner className='w-4 h-4 animate-spin' />
					) : (
						<Plus className='w-4 h-4' />
					)}
					Add
				</Button>
			</div>
		</div>
	);
}
