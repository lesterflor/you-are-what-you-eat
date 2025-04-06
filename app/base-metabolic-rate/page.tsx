import BMRCalculatorForm from '@/components/bmr/bmr-calculator';
import TruncateSection from '@/components/truncate-section';
import { auth } from '@/db/auth';
import { GetUser } from '@/types';
import { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
	title: '(BMR) Base Metabolic Rate'
};

export default async function BMRPage() {
	const session = await auth();
	const user = session?.user as GetUser;

	return (
		<div className='flex flex-col gap-4'>
			<div className='text-2xl font-semibold'>Base Metabolic Rate (BMR)</div>
			<div className='flex flex-col lg:grid grid-cols-[40%,60%] gap-6'>
				<div className='text-sm'>
					<TruncateSection
						allowSeeMore={true}
						pixelHeight={300}>
						<p className='pb-5 text-muted-foreground'>
							The basal metabolic rate (BMR) is the amount of energy needed
							while resting in a temperate environment when the digestive system
							is inactive. It is the equivalent of figuring out how much gas an
							idle car consumes while parked. In such a state, energy will be
							used only to maintain vital organs, which include the heart,
							brain, kidneys, nervous system, intestines, liver, lungs, sex
							organs, muscles, and skin. For most people, upwards of ~70% of
							total energy (calories) burned each day is due to upkeep. Physical
							activity makes up ~20% of expenditure and ~10% is used for the
							digestion of food, also known as thermogenesis.
						</p>
						<p className='pb-5 text-muted-foreground'>
							The BMR is measured under very restrictive circumstances while
							awake. An accurate BMR measurement requires that a person&apos;s
							sympathetic nervous system is inactive, which means the person
							must be completely rested. Basal metabolism is usually the largest
							component of a person&apos;s total caloric needs. The daily
							caloric need is the BMR value multiplied by a factor with a value
							between 1.2 and 1.9, depending on activity level.
						</p>
						<p className='pb-5 text-muted-foreground'>
							n most situations, the BMR is estimated with equations summarized
							from statistical data. The Harris-Benedict Equation was one of the
							earliest equations introduced. It was revised in 1984 to be more
							accurate and was used up until 1990, when the Mifflin-St Jeor
							Equation was introduced. The Mifflin-St Jeor Equation has been
							shown to be more accurate than the revised Harris-Benedict
							Equation. The Katch-McArdle Formula is slightly different in that
							it calculates resting daily energy expenditure (RDEE), which takes
							lean body mass into account, something that neither the Mifflin-St
							Jeor nor the Harris-Benedict Equation does. Of these equations,
							the Mifflin-St Jeor Equation is considered the most accurate
							equation for calculating BMR with the exception that the
							Katch-McArdle Formula can be more accurate for people who are
							leaner and know their body fat percentage.
						</p>
					</TruncateSection>
				</div>

				<div>
					<div className='hidden'>
						{user && user.name && <div>{user.name}, calculate your BMR</div>}
					</div>
					<BMRCalculatorForm />
				</div>
			</div>
		</div>
	);
}
