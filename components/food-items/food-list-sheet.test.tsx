import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import FoodListSheet from './food-list-sheet';

// Mocks
jest.mock('@/actions/food-actions', () => ({
	getFoodItems: jest.fn().mockResolvedValue({
		success: true,
		data: [{ id: '1', name: 'Apple', category: 'fruit', userId: 'u1' }]
	}),
	compareLocalFoods: jest.fn().mockResolvedValue({
		success: true,
		data: [{ id: '1', name: 'Apple', category: 'fruit', userId: 'u1' }]
	}),
	getFavouriteFoods: jest.fn().mockResolvedValue({
		success: true,
		data: [{ id: '2', name: 'Banana', category: 'fruit', userId: 'u2' }]
	})
}));

jest.mock('@/lib/hooks', () => ({
	useAppDispatch: () => jest.fn(),
	useAppSelector: jest.fn((selector) => {
		if (selector.name === 'selectFoodSearchData')
			return { category: 'fruit', user: 'u1', term: '' };
		if (selector.name === 'selectFoodSearchStatus') return 'all';
		if (selector.name === 'selectFoodUpdateData') return {};
		if (selector.name === 'selectFoodUpdateStatus') return 'idle';
		return {};
	})
}));
jest.mock('@/lib/utils', () => ({
	cn: (...args: any[]) => args.join(' '),
	getStorageItem: jest.fn(() => null),
	setStorageItem: jest.fn()
}));

// Minimal mocks for child components
const MockFoodItemCard = (props: any) => (
	<div data-testid='food-item-card'>{props.item.name}</div>
);

MockFoodItemCard.displayName = 'MockFoodItemCard';
jest.mock('./food-item-card', () => MockFoodItemCard);
const MockButton = ({ children }: { children: React.ReactNode }) => (
	<button>{children}</button>
);
MockButton.displayName = 'MockButton';
jest.mock('../ui/button', () => MockButton);
jest.mock('../ui/sheet', () => ({
	Sheet: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
	SheetContent: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	SheetDescription: () => <div />,
	SheetTitle: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	SheetTrigger: ({ children, ...rest }: { children: React.ReactNode }) => (
		<div {...rest}>{children}</div>
	)
}));
jest.mock('../ui/popover', () => ({
	Popover: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	PopoverContent: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	),
	PopoverTrigger: ({ children }: { children: React.ReactNode }) => (
		<div>{children}</div>
	)
}));
const MockScrollArea = ({ children }: { children: React.ReactNode }) => (
	<div>{children}</div>
);
MockScrollArea.displayName = 'MockScrollArea';
jest.mock('../ui/scroll-area', () => MockScrollArea);
const MockFoodCategories = () => <div data-testid='food-category-picker' />;
MockFoodCategories.displayName = 'MockFoodCategories';
jest.mock('./food-categories', () => MockFoodCategories);
const MockInputWithButton = ({
	onChange
}: {
	onChange: (val: string) => void;
}) => (
	<input
		data-testid='search-input'
		onChange={(e) => onChange(e.target.value)}
	/>
);
MockInputWithButton.displayName = 'MockInputWithButton';
jest.mock('../input-with-button', () => MockInputWithButton);
const MockDishCreationPopover = () => (
	<div data-testid='dish-creation-popover' />
);
MockDishCreationPopover.displayName = 'MockDishCreationPopover';
jest.mock('../dish/dish-creation-popover', () => MockDishCreationPopover);

describe('FoodListSheet', () => {
	it('renders and fetches foods on mount', async () => {
		render(<FoodListSheet />);
		await waitFor(() => {
			expect(screen.getByText(/Search/)).toBeInTheDocument();
			expect(screen.getByTestId('food-item-card')).toHaveTextContent('Apple');
		});
	});

	it('shows no results message if foods is empty', async () => {
		// Override getFoodItems to return empty
		const { getFoodItems } = require('@/actions/food-actions');
		getFoodItems.mockResolvedValueOnce({ success: true, data: [] });
		render(<FoodListSheet />);
		await waitFor(() => {
			expect(
				screen.getByText(/There are no results for the search you provided/)
			).toBeInTheDocument();
		});
	});

	it('filters foods by search input', async () => {
		render(<FoodListSheet />);
		const input = screen.getByTestId('search-input');
		fireEvent.change(input, { target: { value: 'Apple' } });
		await waitFor(() => {
			expect(screen.getByTestId('food-item-card')).toHaveTextContent('Apple');
		});
	});

	it('renders children in trigger', () => {
		render(
			<FoodListSheet>
				<span>Custom Trigger</span>
			</FoodListSheet>
		);
		expect(screen.getByText('Custom Trigger')).toBeInTheDocument();
	});

	it('shows correct results count', async () => {
		render(<FoodListSheet />);
		await waitFor(() => {
			expect(screen.getByText(/1 result/)).toBeInTheDocument();
		});
	});
});
