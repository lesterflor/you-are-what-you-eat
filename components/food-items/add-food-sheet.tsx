'use client';

import { UtensilsCrossed } from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '../ui/sheet';
import AddFoodItemForm from './add-food-item-form';

export default function AddFoodSheet() {
	return (
		<div>
			<Sheet>
				<SheetTrigger asChild>
					<Button>
						<UtensilsCrossed className='w-6 h-6' /> Add Food Item
					</Button>
				</SheetTrigger>

				<SheetContent side='bottom'>
					<SheetTitle>
						<div className='flex flex-row items-center gap-2'>
							<UtensilsCrossed className='w-6 h-6' /> Add Food Item
						</div>
					</SheetTitle>
					<ScrollArea className='h-[90vh] md:h-[75vh] xl:h-[50vh] pr-5'>
						<AddFoodItemForm />
						<br />
					</ScrollArea>
				</SheetContent>
			</Sheet>
		</div>
	);
}
