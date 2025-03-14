'use client';

import { Plus, UtensilsCrossed } from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '../ui/sheet';
import AddFoodItemForm from './add-food-item-form';
import { useState } from 'react';

export default function AddFoodSheet({ onAdded }: { onAdded?: () => void }) {
	const [isOpen, setIsOpen] = useState(false);
	const [isOpenPortrait, setIsOpenPortrait] = useState(false);

	return (
		<>
			<div className='hidden portrait:block'>
				<Sheet
					open={isOpenPortrait}
					onOpenChange={setIsOpenPortrait}>
					<SheetTrigger asChild>
						<Button>
							<Plus className='w-6 h-6' /> New Food Item
						</Button>
					</SheetTrigger>

					<SheetContent side='top'>
						<SheetTitle>
							<div className='flex flex-row items-center gap-2'>
								<UtensilsCrossed className='w-6 h-6' /> New Food Item
							</div>
						</SheetTitle>
						<ScrollArea className='h-[75vh] md:h-[75vh] xl:h-[50vh] pr-5'>
							<AddFoodItemForm
								onSuccess={() => {
									setIsOpen(false);
									onAdded?.();
								}}
							/>
							<br />
						</ScrollArea>
					</SheetContent>
				</Sheet>
			</div>

			<div className='portrait:hidden'>
				<Sheet
					open={isOpen}
					onOpenChange={setIsOpen}>
					<SheetTrigger asChild>
						<Button>
							<UtensilsCrossed className='w-6 h-6' /> Add Food Item
						</Button>
					</SheetTrigger>

					<SheetContent side='left'>
						<SheetTitle>
							<div className='flex flex-row items-center gap-2'>
								<UtensilsCrossed className='w-6 h-6' /> Add Food Item
							</div>
						</SheetTitle>
						<ScrollArea className='h-full pr-5'>
							<AddFoodItemForm
								onSuccess={() => {
									setIsOpen(false);
								}}
							/>
							<br />
						</ScrollArea>
					</SheetContent>
				</Sheet>
			</div>
		</>
	);
}
