export type CaloricType = 'CARB' | 'PROTEIN' | 'FAT';

const CaloricTypeMutiplier = {
	PROTEIN: 4,
	CARB: 4,
	FAT: 9
};

export default function CaloricGram(
	grams: number,
	type: CaloricType
): { calories: number; type: CaloricType; grams: number } {
	const multipler = CaloricTypeMutiplier[type];

	return {
		calories: multipler * grams,
		type,
		grams
	};
}
