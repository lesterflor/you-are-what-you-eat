import LandingContent from '@/components/landing-content';
import { auth } from '@/db/auth';
import { getAllDishesOptions } from '@/lib/queries/dishQueries';
import { getFavouriteQueryOptions } from '@/lib/queries/favouriteQueries';
import { getCurrentLogQueryOptions } from '@/lib/queries/logQueries';
import { getCurrentWaterQueryOptions } from '@/lib/queries/waterQueries';
import {
	dehydrate,
	HydrationBoundary,
	QueryClient
} from '@tanstack/react-query';
import { lazy } from 'react';

const FoodListSheetLazy = lazy(
	() => import('@/components/food-items/food-list-sheet')
);

const AddFoodSheetLazy = lazy(
	() => import('@/components/food-items/add-food-sheet')
);

const FoodLogListLazy = lazy(() => import('@/components/logs/log-list'));

const queryClient = new QueryClient();

export const preloadWater = () => {
	void queryClient.prefetchQuery({
		queryKey: getCurrentWaterQueryOptions().queryKey,
		queryFn: getCurrentWaterQueryOptions().queryFn
	});
};

export const preloadDishes = () => {
	void queryClient.prefetchQuery({
		queryKey: getAllDishesOptions().queryKey,
		queryFn: getAllDishesOptions().queryFn
	});
};

export default async function Home() {
	preloadWater();
	preloadDishes();

	const session = await auth();

	await Promise.allSettled([
		queryClient.prefetchQuery({
			queryKey: getCurrentLogQueryOptions().queryKey,
			queryFn: getCurrentLogQueryOptions().queryFn
		}),
		queryClient.prefetchQuery({
			queryKey: getFavouriteQueryOptions().queryKey,
			queryFn: getFavouriteQueryOptions().queryFn
		})

		// queryClient.prefetchQuery({
		// 	queryKey: getFoodQueryOptions().queryKey,
		// 	queryFn: getFoodQueryOptions().queryFn
		// })
	]);

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			{session ? (
				<div className='flex flex-col gap-0 w-full h-full'>
					<div className='portrait:hidden flex flex-row items-center justify-between w-full gap-2'>
						<div>
							<AddFoodSheetLazy />
						</div>
						<div className='flex flex-row items-center gap-4'>
							<FoodListSheetLazy />
						</div>
					</div>
					<div className='relative pt-10'>
						<FoodLogListLazy
							useFloaterNav={true}
							iconPosition='top'
							forceColumn={false}
						/>
					</div>
				</div>
			) : (
				<LandingContent />
			)}
		</HydrationBoundary>
	);
}
