import { ChartConfig } from '@/components/ui/chart';

export const pieChartConfig = {
	carb: {
		label: 'Carbs',
		color: 'hsl(var(--chart-2))'
	},
	protein: {
		label: 'Protein',
		color: 'hsl(var(--chart-4))'
	},
	fat: {
		label: 'Fat',
		color: 'hsl(var(--chart-5))'
	}
} satisfies ChartConfig;

export const chartConfig = {
	calories: {
		label: 'Calories',
		color: 'hsl(var(--chart-1))'
	},
	carb: {
		label: 'Carbs',
		color: 'hsl(var(--chart-2))'
	},
	protein: {
		label: 'Protein',
		color: 'hsl(var(--chart-4))'
	},
	fat: {
		label: 'Fat',
		color: 'hsl(var(--chart-3))'
	}
} satisfies ChartConfig;

export const remainderConfig = {
	calories: {
		label: 'Calories',
		color: 'hsl(var(--chart-1))'
	}
} satisfies ChartConfig;
