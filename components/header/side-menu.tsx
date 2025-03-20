'use client';

import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetTitle,
	SheetTrigger
} from '../ui/sheet';
import { Calculator, Database, Menu, UtensilsCrossed } from 'lucide-react';
import Link from 'next/link';
import { GetLog } from '@/types';
import LogSheet from '../logs/log-sheet';
import ModeToggle from './mode-toggle';
import LogButton from '../logs/log-button';
import { usePathname } from 'next/navigation';
import AddFoodSheet from '../food-items/add-food-sheet';
import FoodListSheet from '../food-items/food-list-sheet';
import { Separator } from '../ui/separator';
import { Button } from '../ui/button';
import { useState } from 'react';
import KnowCaloriesBurned from '../logs/know-calories-burned';
import { useCurrentSession } from '@/hooks/use-current-session';

export default function SideMenu({ log }: { log?: GetLog }) {
	const pathname = usePathname();
	const { status } = useCurrentSession();

	const [isOpen, setIsOpen] = useState(false);

	const handleClick = () => {
		setIsOpen(!isOpen);
	};

	return (
		<Sheet
			open={isOpen}
			onOpenChange={setIsOpen}>
			<SheetTrigger>
				<Menu className='w-6 h-6' />
			</SheetTrigger>
			<SheetContent>
				<SheetDescription></SheetDescription>
				<SheetTitle>
					<div className='flex flex-row items-center justify-start gap-5 portrait:gap-3'>
						<Link
							href='/'
							onClick={handleClick}>
							<div className='flex flex-row items-center gap-2'>
								<UtensilsCrossed className='w-8 h-8' />
								<div className='flex flex-col gap-0'>
									<span className='dark:text-white text-black portrait:text-xl text-2xl font-bold thin-title'>
										You are what you eat
									</span>
									<span className='text-xs font-normal'>
										Track the food you eat and stop wondering
									</span>
								</div>
							</div>
						</Link>
					</div>
				</SheetTitle>
				<div className='flex flex-col gap-6 mt-4'>
					<Button asChild>
						<Link
							href='/base-metabolic-rate'
							onClick={handleClick}>
							<Calculator className='w-4 h-4' />
							Calculate your BMR
						</Link>
					</Button>

					{log && <LogSheet log={log as GetLog} />}

					{status === 'authenticated' && (
						<LogButton
							onClick={() => {
								setIsOpen(!isOpen);
							}}
							title='Log History'
						/>
					)}

					{pathname !== '/foods' && (
						<Button
							asChild
							className='w-fit'>
							<Link
								href='/foods'
								onClick={handleClick}
								className='flex flex-row items-center gap-2'>
								<Database className='w-4 h-4' />
								View Food Database
							</Link>
						</Button>
					)}

					{status === 'authenticated' && (
						<AddFoodSheet
							onAdded={() => {
								setIsOpen(!isOpen);
							}}
						/>
					)}

					{pathname !== '/foods' && <FoodListSheet />}

					<KnowCaloriesBurned />

					<Separator />

					<ModeToggle />
				</div>
			</SheetContent>
		</Sheet>
	);
}
