import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import WaterIntake from './water-intake'; // adjust path if needed

// --- mocks ---
jest.mock('@/components/ui/button', () => ({
	__esModule: true,
	Button: (() => {
		const MockButton = React.forwardRef<
			HTMLButtonElement,
			React.ButtonHTMLAttributes<HTMLButtonElement>
		>((props, ref) => (
			<button
				ref={ref}
				data-testid='mock-button'
				{...props}>
				{props.children}
			</button>
		));
		MockButton.displayName = 'MockButton';
		return MockButton;
	})(),
	buttonVariants: jest.fn(() => 'mocked-classname')
}));

jest.mock('@/lib/hooks', () => ({
	useAppDispatch: () => jest.fn()
}));

jest.mock('@/lib/features/log/waterLogSlice', () => ({
	updatedWater: jest.fn()
}));

jest.mock('@/lib/queries/logQueries', () => ({
	getCurrentLogQueryOptions: () => ({
		queryKey: ['log'],
		queryFn: () => ({
			bmrData: { weightInPounds: 160, weightInKilos: 72 }
		})
	})
}));

jest.mock('@/lib/queries/waterQueries', () => ({
	getCurrentWaterQueryOptions: () => ({
		queryKey: ['water'],
		queryFn: () => ({ glasses: 2 })
	})
}));

jest.mock('@/lib/mutations/waterMutations', () => ({
	logWaterMutationOptions: jest.fn(() => ({
		mutationFn: jest.fn()
	}))
}));

// helper wrapper
const renderWithClient = async (ui: React.ReactNode) => {
	const queryClient = new QueryClient();

	await queryClient.setQueryData(['water'], { glasses: 2 });

	return render(
		<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
	);
};

describe('WaterIntake (Jest)', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders daily water requirements', async () => {
		await renderWithClient(
			<WaterIntake showBalloon={true}>
				<button>trigger</button>
			</WaterIntake>
		);

		await fireEvent.click(screen.getByText('trigger')); // open popover

		expect(screen.getByText(/daily water requirements/i)).toBeInTheDocument();
	});

	it('shows balloon badge when closed', async () => {
		await renderWithClient(
			<WaterIntake showBalloon={true}>
				<button>child</button>
			</WaterIntake>
		);

		expect(await screen.findByText('2')).toBeInTheDocument();
	});

	it('increments and decrements glasses via quick buttons', async () => {
		await renderWithClient(
			<WaterIntake showBalloon>
				<button>child</button>
			</WaterIntake>
		);

		fireEvent.click(screen.getByText('child')); // open popover

		// quick button "1 glass / 2 cups"
		fireEvent.click(screen.getByRole('button', { name: /1 2/i }));

		const currentGlasses = await screen.getByTestId('selected-glasses');
		const currentCups = await screen.getByTestId('selected-cups');

		expect(currentGlasses.textContent.trim()).toBe('1');
		expect(currentCups.textContent.trim()).toBe('2');
	});

	// it('disables log button when glasses = 0', async () => {
	// 	await renderWithClient(
	// 		<WaterIntake showBalloon>
	// 			<button>child</button>
	// 		</WaterIntake>
	// 	);

	// 	await fireEvent.click(screen.getByText('child')); // open popover

	// 	const logBtn = await screen.findByRole('button', { name: /Log/i });
	// 	expect(logBtn).toBeDisabled();
	// });

	// it('enables log button when glasses > 0 and calls mutation', async () => {
	// 	const mutateMock = jest.fn();
	// 	(
	// 		require('@/lib/mutations/waterMutations')
	// 			.logWaterMutationOptions as jest.Mock
	// 	).mockReturnValue({
	// 		mutationFn: mutateMock
	// 	});

	// 	await renderWithClient(
	// 		<WaterIntake showBalloon={true}>
	// 			<button>child</button>
	// 		</WaterIntake>
	// 	);

	// 	await fireEvent.click(screen.getByText('child')); // open
	// 	await fireEvent.click(screen.getByTestId('quick-1-glass')); // set 1 glass

	// 	const logBtn = await screen.findByRole('button', { name: /Log/i });
	// 	expect(logBtn).not.toBeDisabled();

	// 	fireEvent.click(logBtn);

	// 	await waitFor(() => {
	// 		expect(mutateMock).toHaveBeenCalled();
	// 	});
	// });
});
