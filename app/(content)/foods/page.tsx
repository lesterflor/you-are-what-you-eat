import { getFoodItems } from '@/actions/food-actions';
import AddFoodSheet from '@/components/food-items/add-food-sheet';
import FoodItemCard from '@/components/food-items/food-item-card';
import SearchFoodInput from '@/components/food-items/search-food-input';
import { auth } from '@/db/auth';
import { GetFoodItem } from '@/types';

export default async function FoodsPage(props: {
	searchParams: Promise<{
		q: string;
	}>;
}) {
	const { q: searchQuery = '' } = await props.searchParams;
	const session = await auth();
	const res = await getFoodItems(searchQuery);

	const { data: foods = [] } = res;

	return (
		<>
			<div className='flex flex-col gap-4'>
				<div className='text-2xl font-bold flex flex-row justify-between gap-4'>
					Food Database
					{session && <AddFoodSheet />}
				</div>
				<div className='text-2xl font-bold flex flex-row justify-between gap-4'>
					<SearchFoodInput />
				</div>
				<div className='flex flex-col gap-6'>
					{foods && foods.length > 0 ? (
						foods.map((item) => (
							<FoodItemCard
								item={item as GetFoodItem}
								key={item.id}
							/>
						))
					) : (
						<div>There are currently no entered food items.</div>
					)}
				</div>
			</div>
		</>
	);
}
