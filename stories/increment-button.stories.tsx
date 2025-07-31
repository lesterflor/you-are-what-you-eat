import IncrementButton from '@/components/increment-button';
import NumberIncrementor from '@/components/number-incrementor';
import { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useArgs } from 'storybook/internal/preview-api';

const meta = {
	title: 'increment button',
	component: IncrementButton,
	tags: ['autodocs']
} satisfies Meta<typeof IncrementButton>;

export default meta;

type Story = StoryObj<typeof meta>;

type IncremntorProps = {
	children: React.ReactNode;
	increment: number;
	onChange?: ((data: number) => void) | undefined;
	allowLongPress?: boolean | undefined;
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
		<NumberIncrementor
			{...args}
			onChange={onChange}
		/>
	);
};

export const Primary: Story = {
	args: {
		onChange: (value) => value,
		allowLongPress: true,
		increment: 1,
		children: [
			<div
				key={0}
				className='text-xs'>
				Number incrementor with defaults
			</div>
		]
	},
	render: renderer
};

export const NoLongPress: Story = {
	args: {
		onChange: (value) => value,
		allowLongPress: false,
		increment: 1,
		children: [
			<div
				key={0}
				className='text-xs'>
				No long press on buttons
			</div>
		]
	},
	render: renderer
};

export const NoChildren: Story = {
	args: {
		onChange: (value) => value,
		allowLongPress: false,
		increment: 1,
		children: []
	},
	render: renderer
};
