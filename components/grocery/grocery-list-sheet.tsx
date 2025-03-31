'use client';

import { Button } from '../ui/button';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetTitle,
	SheetTrigger
} from '../ui/sheet';
import { MdOutlineLocalGroceryStore } from 'react-icons/md';

export default function GrocerListSheet() {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button>
					<MdOutlineLocalGroceryStore className='h-4 w-4' />
					Grocery Lists
				</Button>
			</SheetTrigger>
			<SheetContent
				side='top'
				className='portrait:max-w-[100vw] w-[100vw]'>
				<SheetDescription></SheetDescription>
				<SheetTitle>My Grocery Lists</SheetTitle>

				<div className='flex flex-col items-center justify-between gap-2 w-full'>
					<div>
						<MdOutlineLocalGroceryStore className='h-6 w-6' />
					</div>
					<div></div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
