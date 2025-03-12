'use client';

import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '../ui/sheet';
import AddFoodItemForm from './add-food-item-form';

export default function AddFoodSheet() {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button>Add Food Item</Button>
			</SheetTrigger>
			<SheetContent side='bottom'>
				<SheetTitle>Add Food Item</SheetTitle>
				<ScrollArea className='h-[90vh] pr-5'>
					<AddFoodItemForm />
					<br />
					<br />
				</ScrollArea>
			</SheetContent>
		</Sheet>
	);
}
