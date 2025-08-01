import NumberIncrementor from '@/components/number-incrementor';
import { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Banana } from 'lucide-react';
import { useArgs } from 'storybook/internal/preview-api';

const meta = {
	title: 'number incrementor',
	component: NumberIncrementor,
	tags: ['autodocs']
} satisfies Meta<typeof NumberIncrementor>;

export default meta;

type Story = StoryObj<typeof meta>;

type IncremntorProps = {
	value?: number;
	onChange: (val: number) => void;
	minValue?: number;
	allowDecimalIncrement?: boolean;
	maxValue?: number;
	compactMode?: boolean;
	children?: React.ReactNode;
	allowLongPress?: boolean;
};

const renderer = (args: IncremntorProps) => {
	const [, setArgs] = useArgs();

	const onChange = (value: number) => {
		// Call the provided callback
		args.onChange?.(value);

		// Update the arg in Storybook
		setArgs({ value });
	};

	// Forward all args and overwrite onChange
	return (
		<>
			<NumberIncrementor
				{...args}
				onChange={onChange}
			/>
		</>
	);
};

export const Primary: Story = {
	args: {
		onChange: (value) => value,
		allowLongPress: true,
		children: []
	},
	render: renderer
};

export const PrimaryNoDecimal: Story = {
	args: {
		onChange: (value) => value,
		allowLongPress: true,
		allowDecimalIncrement: false,
		children: []
	},
	render: renderer
};

export const CompactMode: Story = {
	args: {
		onChange: (value) => value,
		compactMode: true,
		allowLongPress: true,
		children: []
	},
	render: renderer
};

export const CompactModeNoDecimal: Story = {
	args: {
		onChange: (value) => value,
		compactMode: true,
		allowDecimalIncrement: false,
		allowLongPress: true,
		children: []
	},
	render: renderer
};

export const WithChildren: Story = {
	args: {
		onChange: (value) => value,
		allowLongPress: true,
		children: [
			<div
				key={0}
				className='text-xs flex flex-row items-center'>
				<Banana className='w-6 h-6' />
				Children rendered here
			</div>
		]
	},
	render: renderer
};

export const NoLongPress: Story = {
	args: {
		onChange: (value) => value,
		allowLongPress: false,
		children: [
			<div
				key={0}
				className='text-xs flex flex-row items-center'>
				Buttons must be pressed
			</div>
		]
	},
	render: renderer
};

export const LimitLessThanNegative10: Story = {
	args: {
		onChange: (value) => value,
		allowLongPress: true,
		minValue: -10,
		children: [
			<div
				key={0}
				className='text-xs flex flex-row items-center'>
				Lower limit -10
			</div>
		]
	},
	render: renderer
};

export const LimitLessThan10: Story = {
	args: {
		onChange: (value) => value,
		allowLongPress: true,
		maxValue: 10,
		children: [
			<div
				key={0}
				className='text-xs flex flex-row items-center'>
				Upper limit 10
			</div>
		]
	},
	render: renderer
};
