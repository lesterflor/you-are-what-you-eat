import AddFoodSheet from '@/components/food-items/add-food-sheet';
import FoodListSheet from '@/components/food-items/food-list-sheet';
import FoodLogList from '@/components/logs/log-list';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { auth } from '@/db/auth';
import Link from 'next/link';

export default async function Home() {
	const session = await auth();

	return (
		<>
			{session ? (
				<div className='flex flex-col gap-4 w-full'>
					<div className='text-lg'>
						You are what you eat,{' '}
						<span className='font-semibold'>{session.user?.name}</span>
					</div>
					<div className='portrait:hidden flex flex-row items-center justify-between w-full gap-2'>
						<div>
							<AddFoodSheet />
						</div>
						<div className='flex flex-row items-center gap-4'>
							<FoodListSheet />
						</div>
					</div>
					<Separator />
					<ScrollArea className='h-[55vh] portrait:h-[65vh]'>
						<FoodLogList useScroller={false} />
					</ScrollArea>
				</div>
			) : (
				<div className='flex flex-col gap-4'>
					<div>Track what you eat, so you know what you are made of.</div>
					<div>Start tracking now!</div>
					<Button asChild>
						<Link href='/sign-in'>Sign In</Link>
					</Button>
				</div>
			)}
		</>
	);
}
