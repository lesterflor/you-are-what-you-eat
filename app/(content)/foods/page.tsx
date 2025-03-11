import { getFoodItems } from '@/actions/food-actions';
import AddFoodItemForm from '@/components/food-items/add-food-item-form';
import FoodItemCard from '@/components/food-items/food-item-card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
	Sheet,
	SheetContent,
	SheetTitle,
	SheetTrigger
} from '@/components/ui/sheet';
import { auth } from '@/db/auth';
import { GetFoodItem } from '@/types';

export default async function FoodsPage() {
	const session = await auth();
	const res = await getFoodItems();

	const { data: foods = [] } = res;

	return (
		<div className='flex flex-col gap-4'>
			<div className='text-2xl font-bold flex flex-row justify-between'>
				Food List
				{session && (
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
				)}
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
	);
}
