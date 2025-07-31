import DateRangeChooser from '@/components/date-range-chooser';
import { Meta, StoryObj } from '@storybook/nextjs-vite';
import { DateRange } from 'react-day-picker';
import { useArgs } from 'storybook/internal/preview-api';

const meta = {
	title: 'date range chooser',
	component: DateRangeChooser,
	tags: ['autodocs']
} satisfies Meta<typeof DateRangeChooser>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {
	args: {
		onSelect: (value) => value
	},
	render: function Component(args) {
		const [, setArgs] = useArgs();

		const onSelect = (value: DateRange | undefined) => {
			// Call the provided callback
			args.onSelect?.(value);

			// Update the arg in Storybook
			setArgs({ value });
		};

		// Forward all args and overwrite onSelect
		return (
			<DateRangeChooser
				{...args}
				onSelect={onSelect}
			/>
		);
	}
};
