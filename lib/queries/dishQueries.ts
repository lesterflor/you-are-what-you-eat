import { getAllDishes } from '@/actions/prepared-dish-actions';
import { useQuery } from '@tanstack/react-query';
import { getStorageItem } from '../utils';

export default function DishQueries() {
	const { data, isLoading, error, isFetching, isFetched } = useQuery({
		queryKey: ['dishes'],
		queryFn: getAllDishes,
		select: (res) => res.data,
		initialData: () => getStorageItem('preparedDishes') || []
	});

	return { data, isLoading, error, isFetched, isFetching };
}
