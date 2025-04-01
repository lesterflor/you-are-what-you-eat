import FoodList from '@/components/food-items/food-list';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Food Database'
};

export default async function FoodsPage() {
	return (
		<>
			<FoodList />
		</>
	);
}
