'use client';

import { Plus, User, UtensilsCrossed } from 'lucide-react';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '../ui/sheet';
import AddFoodItemForm from './add-food-item-form';
import { useState } from 'react';
import { useCurrentSession } from '@/hooks/use-current-session';
import Link from 'next/link';

export default function AddFoodSheet({ onAdded }: { onAdded?: () => void }) {
	const [isOpen, setIsOpen] = useState(false);
	const [isOpenPortrait, setIsOpenPortrait] = useState(false);
	const { status } = useCurrentSession();

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
								<UtensilsCrossed className='w-6 h-6' />
								{status === 'authenticated'
									? 'New Food Item'
									: 'Sign in to Add Food Items'}
							</div>
						</SheetTitle>

						{status === 'authenticated' ? (
							<ScrollArea className='h-[75vh] md:h-[75vh] xl:h-[50vh] pr-5'>
								<AddFoodItemForm
									onSuccess={() => {
										setIsOpenPortrait(false);
										onAdded?.();
									}}
								/>

								<br />
							</ScrollArea>
						) : (
							<div className='flex flex-row items-center justify-center w-full'>
								<br />
								<br />
								<br />
								<Button asChild>
									<Link href='/sign-in'>
										<User className='w-4 h-4' />
										Sign in
									</Link>
								</Button>
							</div>
						)}
					</SheetContent>
				</Sheet>
			</div>

			<div className='portrait:hidden'>
				<Sheet
					open={isOpen}
					onOpenChange={setIsOpen}>
					<SheetTrigger asChild>
						<Button>
							<UtensilsCrossed className='w-6 h-6' /> New Food Item
						</Button>
					</SheetTrigger>

					<SheetContent side='left'>
						<SheetTitle>
							<div className='flex flex-row items-center gap-2'>
								<UtensilsCrossed className='w-6 h-6' />
								{status === 'authenticated'
									? 'New Food Item'
									: 'Sign in to Add Food Items'}
							</div>
						</SheetTitle>

						{status === 'authenticated' ? (
							<ScrollArea className='h-full pr-2'>
								<AddFoodItemForm
									onSuccess={() => {
										setIsOpen(false);
									}}
								/>
								<br />
							</ScrollArea>
						) : (
							<div className='flex flex-row items-center justify-center w-full'>
								<br />
								<br />
								<br />
								<Button asChild>
									<Link href='/sign-in'>
										<User className='w-4 h-4' />
										Sign in
									</Link>
								</Button>
							</div>
						)}
					</SheetContent>
				</Sheet>
			</div>
		</>
	);
}
