import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NumberIncrementor from './number-incrementor';

async function longPress(target: string) {
	const myTarget = await screen.getByTestId(target);
	const user = userEvent.setup();
	await user.pointer({
		keys: '[MouseLeft>]',
		target: myTarget
	});
	await new Promise((resolve) => {
		setTimeout(resolve, 1000);
	});
	await user.pointer({ keys: '[/MouseLeft]', target: myTarget });
}

describe('NumberIncrementor (Jest)', () => {
	it('should increment more than 1 on long press', async () => {
		const mockFn = jest.fn((val: number) => val);

		render(<NumberIncrementor onChange={mockFn} />);

		const value = screen.getByTestId('current-value');

		// Initial state
		expect(value.textContent).toBe('0');

		// long press
		await longPress('increment-button');

		// increment should be more than just 1
		expect(parseInt(value.textContent)).toBeGreaterThan(1);
	});

	it('number incrementor default value', () => {
		const mockFn = jest.fn((val: number) => val);

		render(<NumberIncrementor onChange={mockFn} />);

		const value = screen.getByTestId('current-value');

		expect(value.textContent).toBe('0');
	});

	it('increments value when increment button is clicked', async () => {
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

	it('increments value when decimcal increment button is clicked', async () => {
		const handleChange = jest.fn((val: number) => val);

		render(
			<NumberIncrementor
				minValue={0}
				maxValue={10}
				onChange={handleChange}
			/>
		);

		const valueDisplay = screen.getByTestId('current-value');
		const incrementBtn = screen.getByTestId('increment-button-decimal');

		// Initial state
		expect(valueDisplay.textContent).toBe('0');

		// Click increment button once
		await userEvent.click(incrementBtn);

		// UI updates
		expect(valueDisplay.textContent).toBe('0.1');

		// onChange is called with updated value
		expect(handleChange).toHaveBeenCalledWith(0.1);
	});

	it('increments value stops at maxValue', async () => {
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

	it('increments value stops at maxValue for increment-button-decimal', async () => {
		const handleChange = jest.fn((val: number) => val);

		render(
			<NumberIncrementor
				value={0.8}
				maxValue={1}
				onChange={handleChange}
			/>
		);

		const valueDisplay = screen.getByTestId('current-value');
		const incrementBtn = screen.getByTestId('increment-button-decimal');

		// Initial state
		expect(valueDisplay.textContent).toBe('0.8');

		// Click increment button once
		await userEvent.click(incrementBtn);

		// UI updates
		expect(valueDisplay.textContent).toBe('0.9');

		// onChange is called with updated value
		expect(handleChange).toHaveBeenCalledWith(0.9);

		// Click increment button again
		await userEvent.click(incrementBtn);

		// UI updates
		expect(valueDisplay.textContent).toBe('1');

		// onChange is called with updated value
		expect(handleChange).toHaveBeenCalledWith(1);

		// Click increment button again from 1
		await userEvent.click(incrementBtn);

		// UI updates should not go beyond max
		expect(valueDisplay.textContent).toBe('1');

		// onChange is called with same value as maxValue is 1
		expect(handleChange).toHaveBeenCalledWith(1);
	});

	it('decrements value when decrement button is clicked', async () => {
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

	it('decrements value when decimcal decrement button is clicked', async () => {
		const handleChange = jest.fn((val: number) => val);

		render(
			<NumberIncrementor
				value={5}
				onChange={handleChange}
			/>
		);

		const valueDisplay = screen.getByTestId('current-value');
		const decrementBtn = screen.getByTestId('decrement-button-decimal');

		// Initial state
		expect(valueDisplay.textContent).toBe('5');

		// Click decrement button once
		await userEvent.click(decrementBtn);

		// UI updates
		expect(valueDisplay.textContent).toBe('4.9');

		// onChange is called with updated value
		expect(handleChange).toHaveBeenCalledWith(4.9);
	});

	it('decrements value should not go lower than minValue', async () => {
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

	it('decrements value should not go lower than minValue with decrement-decimal button', async () => {
		const handleChange = jest.fn((val: number) => val);

		render(
			<NumberIncrementor
				value={0.5}
				minValue={0}
				onChange={handleChange}
			/>
		);

		const valueDisplay = screen.getByTestId('current-value');
		const decrementBtn = screen.getByTestId('decrement-button-decimal');

		// Initial state
		expect(valueDisplay.textContent).toBe('0.5');

		// Click decrement button once
		await userEvent.click(decrementBtn);

		// UI updates
		expect(valueDisplay.textContent).toBe('0.4');

		// onChange is called with updated value
		expect(handleChange).toHaveBeenCalledWith(0.4);

		// Click decrement button again from 0.4
		await userEvent.click(decrementBtn);

		// UI updates
		expect(valueDisplay.textContent).toBe('0.3');

		// onChange is called with same value as min is 0
		expect(handleChange).toHaveBeenCalledWith(0.3);

		// Click decrement button again from 0.3
		await userEvent.click(decrementBtn);
		// Click decrement button again from 0.2
		await userEvent.click(decrementBtn);
		// Click decrement button again from 0.1
		await userEvent.click(decrementBtn);

		// Click decrement button again from 0
		await userEvent.click(decrementBtn);

		// UI updates value should not be lower than min
		expect(valueDisplay.textContent).toBe('0');

		// onChange is called with same value as min is 0
		expect(handleChange).toHaveBeenCalledWith(0);
	});
});
