import { GetFoodItem } from '@/types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import React from 'react';
import NewItemsBadge from './new-items-badge'; // adjust path if needed

jest.mock('@/lib/queries/foodQueries', () => ({
	getFoodQueryOptions: () => ({
		queryKey: ['food'],
		queryFn: () => [{ id: '1234', createdAt: new Date() }]
	})
}));

// generate an item with a specific date
const generateFoodItem = (date: Date): GetFoodItem => {
	return {
		id: `${Math.random()}`,
		createdAt: date,
		updatedAt: date,
		calories: 0,
		carbGrams: 0,
		category: '',
		description: '',
		fatGrams: 0,
		image: '',
		name: '',
		proteinGrams: 0,
		servingSize: 1
	};
};

// helper wrapper
const renderWithClient = async (
	ui: React.ReactNode,
	dataArr: GetFoodItem[]
) => {
	const queryClient = new QueryClient();

	await queryClient.setQueryData(['food'], dataArr);

	return render(
		<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
	);
};

describe('NewItemsBadge (Jest)', () => {
	it('should render nothing if there are no new items', async () => {
		// no data items []
		const { container } = await renderWithClient(<NewItemsBadge />, []);

		expect(container).toBeEmptyDOMElement();
	});

	it('should render nothing if items are all out of range', async () => {
		// all items are out of 7 day range
		const foodArr = Array.from({ length: 100 }).map(() =>
			generateFoodItem(new Date('September 1, 2025'))
		);

		const { container } = await renderWithClient(<NewItemsBadge />, foodArr);

		expect(container).toBeEmptyDOMElement();
	});

	it('should render 1 new item if the date is within seven days', async () => {
		// 1 item within 7 days
		await renderWithClient(<NewItemsBadge />, [generateFoodItem(new Date())]);

		expect(screen.getByText(/1 new item/i)).toBeInTheDocument();
	});

	it('should render 2 new items if the date is within seven days', async () => {
		// 2 items within 7 days
		await renderWithClient(<NewItemsBadge />, [
			generateFoodItem(new Date()),
			generateFoodItem(new Date())
		]);

		expect(screen.getByText(/2 new items/i)).toBeInTheDocument();
	});

	it('should render 1 new item from 2, 1 is out of range', async () => {
		await renderWithClient(<NewItemsBadge />, [
			generateFoodItem(new Date()),
			generateFoodItem(new Date('September 1, 2025')) // out of 7 day range from today
		]);

		expect(screen.getByText(/1 new item/i)).toBeInTheDocument();
	});

	it('should trigger callback once button clicked', async () => {
		const user = userEvent.setup();
		const handleClick = jest.fn();

		// 1 item within 7 days, define callback
		await renderWithClient(<NewItemsBadge onBadgeClick={handleClick} />, [
			generateFoodItem(new Date())
		]);

		// trigger
		await user.click(screen.getByRole('button'));

		expect(handleClick).toHaveBeenCalled();
	});
});
