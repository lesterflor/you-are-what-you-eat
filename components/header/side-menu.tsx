'use client';

import { useCurrentSession } from '@/hooks/use-current-session';
import { GetUser } from '@/types';
import { Calculator, Flame, Menu, Soup, UtensilsCrossed } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { redirect, usePathname } from 'next/navigation';
import { useState } from 'react';
import { BiSolidFoodMenu } from 'react-icons/bi';
import { BsBookmarkStarFill } from 'react-icons/bs';
import DishListSheet from '../dish/dish-list-sheet';
import AddFoodSheet from '../food-items/add-food-sheet';
import FoodFavouriteListSheet from '../food-items/food-favourite-list-sheet';
import FoodListSheet from '../food-items/food-list-sheet';
import GrocerListSheet from '../grocery/grocery-list-sheet';
import ExpendedCaloriesButton from '../logs/expended-calories-button';
import LogButton from '../logs/log-button';
import WaterIntake from '../logs/water-intake';
import NoteSheet from '../notes/note-sheet';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetTitle,
	SheetTrigger
} from '../ui/sheet';
import ModeToggle from './mode-toggle';

import { FaGlassWater } from 'react-icons/fa6';
export default function SideMenu() {
	const pathname = usePathname();
	const { status } = useCurrentSession();
	const { data: session } = useSession();
	const user = session?.user as GetUser;

	const [isOpen, setIsOpen] = useState(false);

	const handleClick = () => {
		setIsOpen(!isOpen);
	};

	return (
		<Sheet
			open={isOpen}
			onOpenChange={setIsOpen}>
			<SheetTrigger>
				<Menu
					className='w-6 h-6'
					aria-label='side menu'
				/>
			</SheetTrigger>
			<SheetContent className='max-w-96 w-80 px-3'>
				<SheetDescription></SheetDescription>
				<SheetTitle>
					<div className='flex flex-row items-center justify-start gap-5 portrait:gap-2'>
						<Link
							href='/'
							onClick={handleClick}>
							<div className='flex flex-row items-center gap-2'>
								<UtensilsCrossed className='w-8 h-8' />
								<div className='flex flex-col gap-0'>
									<span className='text-muted-foreground portrait:text-lg text-2xl font-bold thin-title'>
										You are what you eat
									</span>
								</div>
							</div>
						</Link>
					</div>
				</SheetTitle>
				<div className='flex flex-col gap-4 mt-2'>
					{user && (
						<div className='flex flex-row items-center justify-between gap-4 portrait:gap-0'>
							<div className='flex flex-row gap-2 items-center'>
								<Avatar>
									<AvatarImage src={user.image ? user.image : ''} />
									<AvatarFallback>{user.name.slice(0, 1)}</AvatarFallback>
								</Avatar>
								<div>Hi, {user.name}</div>
							</div>

							<ModeToggle />
						</div>
					)}

					{status === 'authenticated' && (
						<div className='flex flex-col item-center gap-1 w-full'>
							<div>Log Info</div>
							<div className='flex flex-col items-stretch gap-4 w-full'>
								{pathname === '/logs' && (
									<Button
										onClick={() => {
											setIsOpen(false);
											redirect('/');
										}}>
										<BiSolidFoodMenu />
										{`Today's Log`}
									</Button>
								)}

								<LogButton
									onClick={() => {
										setIsOpen(!isOpen);
									}}
									title='Log History'
								/>
							</div>
						</div>
					)}

					<div className='flex flex-col items-stretch gap-2 w-full'>
						<div>Tools</div>
						<div className='flex flex-row justify-between flex-wrap gap-3 w-full'>
							<Button asChild>
								<Link
									href='/base-metabolic-rate'
									onClick={handleClick}>
									<Calculator className='w-4 h-4' />
									BMR Calculator
								</Link>
							</Button>

							<NoteSheet />
							<GrocerListSheet />
						</div>
					</div>

					<div className='flex flex-col item-center gap-1'>
						<div>Food</div>
						<div className='flex flex-row items-center justify-between flex-wrap gap-3'>
							{status === 'authenticated' && (
								<AddFoodSheet
									onAdded={() => {
										setIsOpen(!isOpen);
									}}
								/>
							)}

							{pathname !== '/foods' && <FoodListSheet />}
							<DishListSheet>
								<Button>
									<Soup /> Your Dishes
								</Button>
							</DishListSheet>

							<FoodFavouriteListSheet>
								<Button>
									<BsBookmarkStarFill />
									Favourites
								</Button>
							</FoodFavouriteListSheet>

							<ExpendedCaloriesButton>
								<Button>
									<Flame className='w-4 h-4' />
									Expended Calories
								</Button>
							</ExpendedCaloriesButton>

							<WaterIntake useModal={true}>
								<Button>
									<FaGlassWater /> Water Intake
								</Button>
							</WaterIntake>
						</div>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	);
}
