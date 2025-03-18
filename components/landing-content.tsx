import React from 'react';
import { Button } from './ui/button';
import Link from 'next/link';
import { User } from 'lucide-react';

export default function LandingContent() {
	return (
		<div className='flex flex-col gap-4 text-sm'>
			<div className='flex flex-col gap-4'>
				<div className='text-lg font-semibold'>
					Track what you eat, so you know what you are made of.
				</div>
				<div className='flex flex-row items-center gap-4 text-2xl font-semibold'>
					Start tracking now!
					<Button
						asChild
						className='w-24'>
						<Link href='/sign-in'>
							<User className='w-4 h-4' />
							Sign In
						</Link>
					</Button>
				</div>
			</div>
			<br />
			<p>
				Counting calories can help if you want to lose weight. You can begin by
				planning your weekly meals and counting calories per serving. However,
				it&apos;s important to make sure you&apos;re still fulfilling your daily
				energy needs.
			</p>
			<p>
				To lose weight, you typically need to eat fewer calories than you burn.
			</p>

			<p>
				Keep in mind that counting calories is just one way to lose weight. It
				may not work for everyone, and it&apos;s not the only way to maintain a
				healthy diet and lifestyle.
			</p>

			<p>
				Always consider your food quality, portions, and fullness signals as
				well when trying to lose weight. You can speak with a healthcare
				professional, such as a dietitian, to help identify your individual food
				needs and goals.
			</p>

			<br />

			<h1 className='text-2xl font-semibold'>What are Calories?</h1>

			<p>
				Calories are a measure of energy, typically used to measure the energy
				content of foods and beverages.
			</p>

			<p>
				Your body uses the calories you eat and drink for essential functions,
				such as breathing and thinking, as well as day-to-day activities, such
				as:
			</p>
			<ul className='list-disc ml-5 space-y-2'>
				<li>Walking</li>
				<li>Talking</li>
				<li>Sleeping</li>
				<li>Eating</li>
			</ul>

			<p>
				Any excess calories you eat are stored as fat, so consistently eating
				more than you burn may lead to weight gain over time.
			</p>

			<br />
			<h1 className='text-2xl font-semibold'>
				What is my recommended caloric intake?
			</h1>

			<p>How many calories you need depends on several factors, including:</p>
			<ul className='list-disc ml-5 space-y-2'>
				<li>gender</li>
				<li>age</li>
				<li>weight</li>
				<li>activity level</li>
			</ul>

			<p>
				If you’re trying to lose weight, you will typically need to create a
				calorie deficit by eating less than your body burns off.
			</p>

			<p>
				You can use this <Link href='/base-metabolic-rate'>calculator</Link> to
				determine how many calories you should eat per day.
			</p>

			<p>
				The World Health Organization (WHO)Trusted Source has recommendations
				for a healthy diet, which includes:
			</p>

			<ul className='list-disc ml-5 space-y-2'>
				<li>eating five portions of fruits and vegetables per day</li>
				<li>not getting more than 5% of calories from added sugar</li>
				<li>
					getting around 30% of your total energy intake from fats, such as fish
					and oils
				</li>
				<li>
					eating 5 grams of iodized salt (equivalent to about 1 teaspoon) per
					day
				</li>
			</ul>

			<br />
			<h1 className='text-2xl font-semibold'>Why Calories Count</h1>

			<p>
				When it comes to your weight, calories do count. This fact has been
				proven time and time again in scientific experiments called overfeeding
				studies.
			</p>

			<p>
				These studies ask people to deliberately overeat and subsequently
				measure the effect on their weight and health. All overfeeding studies
				have found that when people eat more calories than they burn off, they
				gain weight.
			</p>

			<p>
				A 2022{' '}
				<Link
					href='https://onlinelibrary.wiley.com/doi/abs/10.1002/oby.23377'
					target='_blank'>
					study
				</Link>{' '}
				split participants into two groups: those who tracked their calories and
				those who self-monitored high calorie foods. Both groups lost
				significant amounts of weight at the 6-month mark (5.7% and 4% on
				average, respectively).
			</p>

			<p>
				Thus, if it’s not possible to count all of your calories, you may be
				able to focus on high calorie foods and still lose weight.
			</p>

			<p>
				However, calorie counting isn’t the only effective method for weight
				loss. It’s also important to:
			</p>

			<ul className='list-disc ml-5 space-y-2'>
				<li>incorporate whole foods into your diet</li>
				<li>exercise regularly</li>
				<li>maintain good sleep hygiene</li>
			</ul>

			<br />
			<h1 className='text-2xl font-semibold'>
				How to weigh and measure your portions
			</h1>

			<p>
				Portion sizes have increased over time. In some restaurants, a single
				meal can provide double or triple the average person’s daily needs.
			</p>

			<p>
				“Portion distortion” is the term for when you view large servings of
				foods as the norm. It can cause weight gain and hinder weight loss.
			</p>

			<p>
				It can be tricky to estimate how much you eat each day. Calorie counting
				can help you manage overeating by giving you a better understanding of
				how much you are consuming.
			</p>

			<p>
				For it to work, you need to record food portions correctly. Here are a
				few common ways to measure portion sizes:
			</p>

			<ul className='list-disc ml-5 space-y-2'>
				<li>
					<b>Scales:</b> Weighing your food is the most accurate way to
					determine how much you’re eating.
				</li>
				<li>
					<b>Measuring cups:</b> Standard volume measures may be slightly
					quicker and easier to use than a scale.
				</li>
				<li>
					<b>Comparisons:</b> Comparing common items is quick and easy,
					especially if you’re away from home. However, this can be much less
					accurate.
				</li>
			</ul>

			<br />
			<h1 className='text-xl font-semibold'>Common Examples</h1>

			<p>
				Here are some common serving sizes compared with household items that
				may help you estimate your portion sizes:
			</p>

			<ul className='list-disc ml-5 space-y-2'>
				<li>1 serving of leafy green vegetables (1 cup): a baseball</li>
				<li>
					1 serving of rice or pasta (1/2 cup): a computer mouse or rounded
					handful
				</li>
				<li>1 serving of vegetables (1/2 cup): a computer mouse</li>
				<li>1 serving of fresh fruit (1/2 cup): a tennis ball</li>
				<li>1 serving of meat (3 ounces): a deck of cards</li>
				<li>1 serving of fish (3 ounces): a checkbook</li>
				<li>
					1 serving of cheese (1.5 ounces): a lipstick tube or the size of your
					thumb
				</li>
				<li>1 serving of peanut butter (2 tablespoons): a ping-pong ball</li>
				<li>1 serving of olive oil (1 teaspoon): 1 fingertip</li>
			</ul>

			<p>
				Calorie counting isn’t an exact science, even when you weigh and measure
				portions.
			</p>

			<p>
				However, it’s not necessary to be entirely spot-on with your
				measurements. Just make sure to record your intake as accurately as you
				can.
			</p>

			<p>
				Try to be most careful about recording items that are high in fat or
				sugar, such as pizza, ice cream, and oils. Under-recording these foods
				can cause a big difference between your recorded and actual intake.
			</p>

			<p>
				To improve your estimations, you can try using a food scale in the
				beginning to give you a better idea of what a portion looks like for
				various foods. This can help you be more accurate, even after you stop
				using the scale.
			</p>

			<br />
			<h1 className='text-2xl font-semibold'>
				Tips to succeed with calorie counting
			</h1>

			<p>Here are a few more tips to help with counting calories:</p>

			<ul className='list-disc ml-5 space-y-2'>
				<li>
					<b>Be prepared:</b> Before you start, consider getting a
					calorie-counting app or online tool, decide how you will measure or
					estimate portions, and make a meal plan.
				</li>
				<li>
					<b>Read food labels:</b> Food labels contain lots of useful
					information for calorie counting. Make sure you check the portion size
					recommended on the package.
				</li>
				<li>
					<b>Aim for slow, steady weight loss:</b> A 2020 studyTrusted Source
					found that greater weight variability at 9 and 12 weeks into a weight
					loss intervention predicted increased weight at 12 and 18 months from
					the start.
				</li>
				<li>
					<b>Fuel your exercise:</b> The most successful weight loss programs
					include both diet and exercise. Make sure to eat enough to still have
					the energy to exercise.
				</li>
			</ul>

			<br />
			<h1 className='text-2xl font-semibold'>The takeaway</h1>

			<p>Counting calories can be helpful if you want to lose weight.</p>

			<p>
				But it may not work for everyone and is not the only way to maintain a
				healthy diet and lifestyle.
			</p>

			<p>
				You also need to consider food quality, portions, and fullness signals.
				It’s important to ensure you’re still fulfilling your daily energy
				needs, even if you decide to count calories.
			</p>
		</div>
	);
}
