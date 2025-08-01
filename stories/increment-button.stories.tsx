import IncrementButton from '@/components/increment-button';
import { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Plus } from 'lucide-react';

import { fn } from 'storybook/test';

const meta = {
	title: 'increment button',
	component: IncrementButton,
	tags: ['autodocs'],
	args: { onChange: fn() }
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
	// const [, setArgs] = useArgs();

	// const onChange = (value: number) => {
	// 	// Call the provided callback
	// 	args.onChange?.(value);

	// 	// Update the arg in Storybook
	// 	setArgs({ value });
	// };

	// Forward all args and overwrite onChange
	return (
		<>
			<div className='text-muted-foreground'>{args.increment}</div>
			<IncrementButton
				{...args}
				//onChange={onChange}
			/>
		</>
	);
};

export const Primary: Story = {
	args: {
		//onChange: (value) => value,
		allowLongPress: true,
		increment: 1,
		children: [
			<Plus
				key={0}
				className='w-6 h-6'
			/>
		]
	},
	render: renderer
};

export const NoLongPress: Story = {
	args: {
		//onChange: (value) => value,
		allowLongPress: false,
		increment: 1,
		children: [
			<Plus
				key={0}
				className='w-6 h-6'
			/>
		]
	},
	render: renderer
};

export const IncrementBy5: Story = {
	args: {
		//onChange: (value) => value,
		allowLongPress: false,
		increment: 5,
		children: [
			<Plus
				key={0}
				className='w-6 h-6'
			/>
		]
	},
	render: renderer
};
