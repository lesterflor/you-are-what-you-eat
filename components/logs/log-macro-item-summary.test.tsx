import { GetFoodEntry } from '@/types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import LogMacroItemSummary from './log-macro-item-summary';

jest.mock('@/lib/queries/logQueries', () => ({
	getCurrentLogQueryOptions: () => ({
		queryKey: ['logMock'],
		queryFn: () => ({
			foodItems: [
				{
					id: '123',
					name: 'Pizza',
					calories: 200,
					numServings: 1,
					proteinGrams: 20
				}
			]
		})
	})
}));

const generateFoodItem = (macros: {
	protein?: number;
	carbs?: number;
	fat?: number;
	calories?: number;
}): GetFoodEntry => {
	return {
		id: `${Math.random}`,
		eatenAt: new Date(),
		numServings: 1,
		calories: macros.calories ?? 0,
		carbGrams: macros.carbs ?? 0,
		proteinGrams: macros.protein ?? 0,
		fatGrams: macros.fat ?? 0,
		category: 'test',
		description: '',
		image: '',
		name: 'test name'
	};
};

const renderWithClient = async (ui: React.ReactNode, data: GetFoodEntry[]) => {
	const queryClient = new QueryClient();

	await queryClient.setQueryData(['logMock'], { foodItems: data });

	return render(
		<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
	);
};

describe('LogMacroItemSummary (Jest)', () => {
	it('should render nothing if there is no foodItems in the log', async () => {
		const { container } = await renderWithClient(
			<LogMacroItemSummary macro='protein' />,
			[] // there are no food items in the log
		);

		expect(container).toBeEmptyDOMElement();
	});

	it('should render 1 item with the calories of the item', async () => {
		await renderWithClient(<LogMacroItemSummary macro='calories' />, [
			generateFoodItem({ calories: 200 })
		]);

		expect(screen.getByText(/200/i)).toBeInTheDocument();
	});

	it('should render the items in order of macro provided', async () => {
		const numberOfFoodItems = 100;

		const proteinArr = Array.from({ length: numberOfFoodItems }).map(
			(_, indx) => {
				return generateFoodItem({ protein: Math.abs(Math.random() * indx) });
			}
		);

		await renderWithClient(<LogMacroItemSummary macro='protein' />, proteinArr);

		const values = screen.getAllByTestId('macro-field');

		// the number of items should be correct based on the macro
		expect(values.length).toBe(numberOfFoodItems);

		// extract the text of each node
		const nodeValues = values.map((node) => +node.textContent);

		// helper to see if food items are listed in descending order from greatest to least
		const isDescending = (a: number[]) => a.slice(1).every((e, i) => e <= a[i]);

		// the items should be listed descending in value
		expect(isDescending(nodeValues)).toBeTruthy();
	});

	it('should only list the values based on the macro prop', async () => {
		const mixedArr = [
			generateFoodItem({ protein: 2 }), // valid
			generateFoodItem({ protein: 20 }), // valid
			generateFoodItem({ protein: 13 }), // valid
			generateFoodItem({ carbs: 2 }),
			generateFoodItem({ fat: 2 }),
			generateFoodItem({ fat: 26 }),
			generateFoodItem({ fat: 53 }),
			generateFoodItem({ calories: 456 })
		];

		await renderWithClient(<LogMacroItemSummary macro='protein' />, mixedArr);

		const nodes = screen.getAllByTestId('macro-field');

		// there are 8 food items
		expect(nodes.length).toBe(8);

		// extract the text of each node
		const nodeValues = nodes.map((node) => +node.textContent);

		// there are only 3 items with protein values
		expect(nodeValues.filter((item) => item > 0).length).toBe(3);
	});
});
