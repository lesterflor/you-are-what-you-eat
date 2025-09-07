import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NumberIncrementor from './number-incrementor';

test('number incrementor default value', () => {
	const mockFn = jest.fn((val: number) => val);

	render(<NumberIncrementor onChange={mockFn} />);

	const value = screen.getByTestId('current-value');

	expect(value.textContent).toBe('0');
});

test('increments value when increment button is clicked', async () => {
	const handleChange = jest.fn((val: number) => val);

	render(
		<NumberIncrementor
			minValue={0}
			maxValue={10}
			onChange={handleChange}
		/>
	);

	const valueDisplay = screen.getByTestId('current-value');
	const incrementBtn = screen.getByTestId('increment-button');

	// Initial state
	expect(valueDisplay.textContent).toBe('0');

	// Click increment button once
	await userEvent.click(incrementBtn);

	// UI updates
	expect(valueDisplay.textContent).toBe('1');

	// onChange is called with updated value
	expect(handleChange).toHaveBeenCalledWith(1);
});

test('increments value stops at maxValue', async () => {
	const handleChange = jest.fn((val: number) => val);

	render(
		<NumberIncrementor
			minValue={0}
			maxValue={2}
			onChange={handleChange}
		/>
	);

	const valueDisplay = screen.getByTestId('current-value');
	const incrementBtn = screen.getByTestId('increment-button');

	// Initial state
	expect(valueDisplay.textContent).toBe('0');

	// Click increment button once
	await userEvent.click(incrementBtn);

	// UI updates
	expect(valueDisplay.textContent).toBe('1');

	// onChange is called with updated value
	expect(handleChange).toHaveBeenCalledWith(1);

	// Click increment button again
	await userEvent.click(incrementBtn);

	// UI updates
	expect(valueDisplay.textContent).toBe('2');

	// onChange is called with updated value
	expect(handleChange).toHaveBeenCalledWith(2);

	// Click increment button again from 2
	await userEvent.click(incrementBtn);

	// UI updates
	expect(valueDisplay.textContent).toBe('2');

	// onChange is called with same value as maxValue is 2
	expect(handleChange).toHaveBeenCalledWith(2);
});

test('decrements value when decrement button is clicked', async () => {
	const handleChange = jest.fn((val: number) => val);

	render(
		<NumberIncrementor
			value={5}
			onChange={handleChange}
		/>
	);

	const valueDisplay = screen.getByTestId('current-value');
	const decrementBtn = screen.getByTestId('decrement-button');

	// Initial state
	expect(valueDisplay.textContent).toBe('5');

	// Click decrement button once
	await userEvent.click(decrementBtn);

	// UI updates
	expect(valueDisplay.textContent).toBe('4');

	// onChange is called with updated value
	expect(handleChange).toHaveBeenCalledWith(4);
});

test('decrements value should not go lower than minValue', async () => {
	const handleChange = jest.fn((val: number) => val);

	render(
		<NumberIncrementor
			value={1}
			minValue={0}
			onChange={handleChange}
		/>
	);

	const valueDisplay = screen.getByTestId('current-value');
	const decrementBtn = screen.getByTestId('decrement-button');

	// Initial state
	expect(valueDisplay.textContent).toBe('1');

	// Click decrement button once
	await userEvent.click(decrementBtn);

	// UI updates
	expect(valueDisplay.textContent).toBe('0');

	// onChange is called with updated value
	expect(handleChange).toHaveBeenCalledWith(0);

	// Click decrement button again from 0
	await userEvent.click(decrementBtn);

	// UI updates
	expect(valueDisplay.textContent).toBe('0');

	// onChange is called with same value as min is 0
	expect(handleChange).toHaveBeenCalledWith(0);
});
