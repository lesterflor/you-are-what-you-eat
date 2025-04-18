import AddFoodSheet from '@/components/food-items/add-food-sheet';
import FoodListSheet from '@/components/food-items/food-list-sheet';
import LandingContent from '@/components/landing-content';
import FoodLogList from '@/components/logs/log-list';
import { auth } from '@/db/auth';

export default async function Home() {
	const session = await auth();

	return (
		<>
			{session ? (
				<div className='flex flex-col gap-4 w-full h-full'>
					<div className='text-sm text-muted-foreground portrait:w-[70vw]'>
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
					<div className='relative'>
						<FoodLogList
							useFloaterNav={true}
							iconPosition='top'
							forceColumn={false}
							useScroller={true}
							className='portrait:h-[100%] h-[45vh] portrait:w-[100%]'
						/>
					</div>
				</div>
			) : (
				<LandingContent />
			)}
		</>
	);
}
