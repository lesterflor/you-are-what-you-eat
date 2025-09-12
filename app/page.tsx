import { createDailyLog, todaysWaterConsumed } from '@/actions/log-actions';
import AddFoodSheet from '@/components/food-items/add-food-sheet';
import LandingContent from '@/components/landing-content';
import FoodLogList from '@/components/logs/log-list';
import { auth } from '@/db/auth';
import { GetLog, GetWaterConsumed } from '@/types';
import { lazy } from 'react';

const FoodListSheetLazy = lazy(
	() => import('@/components/food-items/food-list-sheet')
);

export default async function Home() {
	const session = await auth();
	const todaysLog = await createDailyLog();
	const currentWater = await todaysWaterConsumed();

	return (
		<>
			{session ? (
				<div className='flex flex-col gap-0 w-full h-full'>
					<div className='portrait:hidden flex flex-row items-center justify-between w-full gap-2'>
						<div>
							<AddFoodSheet />
						</div>
						<div className='flex flex-row items-center gap-4'>
							<FoodListSheetLazy />
						</div>
					</div>
					<div className='relative pt-10'>
						<FoodLogList
							useFloaterNav={true}
							iconPosition='top'
							forceColumn={false}
							todaysLog={todaysLog?.data as GetLog}
							currentWater={currentWater.data as GetWaterConsumed}
						/>
					</div>
				</div>
			) : (
				<LandingContent />
			)}
		</>
	);
}
