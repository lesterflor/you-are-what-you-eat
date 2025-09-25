import * as hooks from '@/lib/hooks'; // import the whole module
import { MockedFunction } from '@/types';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import InputWithButton from './input-with-button';

jest.mock('@/lib/hooks', () => ({
	...jest.requireActual('@/lib/hooks'),
	useAppSelector: jest.fn()
}));

jest.mock('@/lib/features/food/foodSearchSlice', () => ({
	inputSearch: jest.fn()
}));

describe('InputWithButton (Jest)', () => {
	const mockOnChange = jest.fn();
	const mockUseAppSelector = hooks.useAppSelector as unknown as MockedFunction<
		typeof hooks.useAppSelector
	>;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should render the input field with no clear button', () => {
		render(<InputWithButton onChange={mockOnChange} />);

		expect(screen.getByTestId('input-field')).toBeInTheDocument();

		// clear button should be hidden initially
		const button = screen.getByRole('button');
		expect(button).toHaveClass('hidden');
	});

	it('should should trigger onChange on input for every char', async () => {
		render(<InputWithButton onChange={mockOnChange} />);
		const input = screen.getByTestId('input-field');

		await userEvent.type(input, 'Hello');

		// onChange should be called for each keystroke due to useEffect
		expect(mockOnChange).toHaveBeenCalledWith('');
		expect(mockOnChange).toHaveBeenCalledWith('H');
		expect(mockOnChange).toHaveBeenCalledWith('He');
		expect(mockOnChange).toHaveBeenCalledWith('Hel');
		expect(mockOnChange).toHaveBeenCalledWith('Hell');
		expect(mockOnChange).toHaveBeenCalledWith('Hello');

		// field should have string value
		expect(input).toHaveValue('Hello');

		// clear button should now be visible
		const button = await screen.getByRole('button');
		expect(button).toHaveClass('block');
	});

	it('clears input when button is clicked', async () => {
		render(<InputWithButton onChange={mockOnChange} />);
		const input = screen.getByTestId('input-field');
		const button = screen.getByRole('button');

		// type some value
		await userEvent.type(input, 'Test');

		// click button to clear
		await userEvent.click(button);
		expect(input).toHaveValue('');
	});

	it('resets input when redux state changes to non-idle/input', async () => {
		mockUseAppSelector
			.mockReturnValueOnce('idle') // first render
			.mockReturnValueOnce('input') // user types render
			.mockReturnValueOnce('category'); // user selects a category render

		const { rerender } = render(<InputWithButton onChange={mockOnChange} />);
		const input = screen.getByTestId('input-field');

		// set the local state of input field to have a value
		fireEvent.change(input, { target: { value: 'pizza' } });
		expect(input).toHaveValue('pizza');

		// force re-render so selector returns 'input' then 'category' states
		rerender(<InputWithButton onChange={mockOnChange} />);

		await waitFor(() => {
			expect(input).toHaveValue('');
		});
	});
});
