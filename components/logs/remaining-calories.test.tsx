import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import React from 'react';
import RemainingCalories from './remaining-calories'; // adjust path if needed

// --- mocks ---
jest.mock('@/lib/queries/logQueries', () => ({
	getCurrentLogQueryOptions: () => ({
		queryKey: ['log'],
		queryFn: () => ({
			bmrData: { weightInPounds: 160, weightInKilos: 72 },
			macros: { caloriesConsumed: 200, caloriesRemaining: -300 }
		})
	})
}));

// helper wrapper
const renderWithClient = async (
	ui: React.ReactNode,
	props: {
		caloriesConsumed?: number;
		caloriesRemaining?: number;
		cumulativeRemaining?: -1530;
	} = {
		caloriesConsumed: 300,
		caloriesRemaining: -300
	}
) => {
	const queryClient = new QueryClient();

	await queryClient.setQueryData(['log'], {
		macros: {
			caloriesRemaining: props.caloriesRemaining,
			caloriesConsumed: props.caloriesConsumed,
			cumulativeRemaining: props.cumulativeRemaining,
			bmr: 1530
		}
	});

	return render(
		<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
	);
};

describe('RemainingCalories (Jest)', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('renders calories remaining with surplus', async () => {
		await renderWithClient(<RemainingCalories />);

		expect(screen.getByText(/calories remaining/i)).toBeInTheDocument();

		// arrow down should be in document with smile
		expect(screen.getByTestId('lucide-arrow-down')).toBeInTheDocument();
		expect(screen.getByTestId('smile-icon')).toBeInTheDocument();
	});

	it('renders calories remaining with deficit', async () => {
		await renderWithClient(<RemainingCalories />, {
			caloriesConsumed: 200,
			caloriesRemaining: 200
		});

		expect(screen.getByText(/calories over/i)).toBeInTheDocument();

		// arrow up should be in document with frown
		expect(screen.getByTestId('lucide-arrow-up')).toBeInTheDocument();
		expect(screen.getByTestId('frown-icon')).toBeInTheDocument();
	});

	it('renders calories with no icons, since no consumption', async () => {
		await renderWithClient(<RemainingCalories />, {
			caloriesConsumed: 0,
			caloriesRemaining: -1530
		});

		expect(screen.getByText(/calories remaining/i)).toBeInTheDocument();

		// no icons should appear
		expect(screen.queryByTestId('lucide-arrow-up')).not.toBeInTheDocument();
		expect(screen.queryByTestId('frown-icon')).not.toBeInTheDocument();
		expect(screen.queryByTestId('lucide-arrow-down')).not.toBeInTheDocument();
		expect(screen.queryByTestId('smile-icon')).not.toBeInTheDocument();
	});
});
