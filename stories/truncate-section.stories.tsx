import TruncateSection from '@/components/truncate-section';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Card, CardContent, CardDescription } from '@/components/ui/card';
import '../app/globals.css';

const meta = {
	title: 'truncate section',
	component: TruncateSection,
	tags: ['autodocs'],
	argTypes: {
		allowSeeMore: { control: 'boolean' },
		useCardBG: { control: 'boolean' }
	}
} satisfies Meta<typeof TruncateSection>;

export default meta;

type Story = StoryObj<typeof meta>;

const children = [
	<div
		key={0}
		className='w-96'>
		<p>
			Hello there this is some text that will be displayed in the truncate
			section that will display the primary state of this component. It should
			keep the text that is outside the height bounds of the primary state out
			of view. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem
			ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit
			amet.
		</p>
		<p className='pt-4'>
			Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor
			sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem
			ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit
			amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum
			dolor sit amet. Lorem ipsum dolor sit amet.
		</p>
	</div>
];

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
	args: {
		allowSeeMore: true,
		children
	}
};

export const LabelChange: Story = {
	args: {
		allowSeeMore: true,
		children,
		label: 'See more'
	}
};

export const UseCardBG: Story = {
	args: {
		allowSeeMore: true,
		children: [
			<Card key={0}>
				<CardContent className='w-96'>
					<CardDescription>This is the card description</CardDescription>
					<p>
						Hello there this is some text that will be displayed in the truncate
						section that will display the primary state of this component. It
						should keep the text that is outside the height bounds of the
						primary state out of view. Lorem ipsum dolor sit amet. Lorem ipsum
						dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit
						amet. Lorem ipsum dolor sit amet.
					</p>
					<p>
						Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum
						dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit
						amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem
						ipsum dolor sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor
						sit amet. Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet.
					</p>
				</CardContent>
			</Card>
		],
		useCardBG: true
	}
};

export const PixelHeightChange: Story = {
	args: {
		allowSeeMore: true,
		children,
		pixelHeight: 75
	}
};
