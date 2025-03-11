import { getFoodItems } from '@/actions/food-actions';
import FoodCategoryIconMapper from '@/components/food-items/food-category-icon-mapper';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader
} from '@/components/ui/card';
import { auth } from '@/db/auth';
import Link from 'next/link';

export default async function FoodsPage() {
	const session = await auth();
	const res = await getFoodItems();

	const { data: foods = [] } = res;

	return (
		<div className='flex flex-col gap-4'>
			<div className='text-2xl font-bold flex flex-row justify-between'>
				Food List
				{session && (
					<Button asChild>
						<Link href='/'>Add Food Item</Link>
					</Button>
				)}
			</div>
			<div className='flex flex-col gap-6'>
				{foods && foods.length > 0 ? (
					foods.map((item) => (
						<Card key={item.id}>
							<CardHeader className='text-xl font-semibold capitalize pb-2 flex flex-row items-center gap-2'>
								<FoodCategoryIconMapper type={item.category} />
								{item.name}
							</CardHeader>
							<CardDescription className='p-6'>
								{item.description}
							</CardDescription>
							<CardContent className='flex flex-row flex-wrap gap-8'>
								<div className='flex flex-row items-center gap-2'>
									Protein: {item.proteinGrams}g
								</div>
								<div className='flex flex-row items-center gap-2'>
									Carbs: {item.carbGrams}g
								</div>
								<div className='flex flex-row items-center gap-2'>
									Fat: {item.fatGrams}g
								</div>
								<div className='flex flex-row items-center gap-2'>
									Serving: {item.servingSize}
								</div>

								<div className='flex flex-row items-center gap-2'>
									<Badge>Calories {item.calories}</Badge>
								</div>
							</CardContent>
						</Card>
					))
				) : (
					<div>There are currently no entered food items.</div>
				)}
			</div>
		</div>
	);
}
