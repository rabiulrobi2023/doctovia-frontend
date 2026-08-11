import { Prisma } from "../../../generated/client";

export interface ISearchableEnumField {
	field: string;
	values: readonly string[];
}

export interface ISearchableNumericField {
	field: string;
}

const buildSearchCondition = <T>(
	searchTerm: string,
	searchableFields: readonly string[],
	enumFields: readonly ISearchableEnumField[] = [],
	numericFields: readonly ISearchableNumericField[] = [],
): T => {
	const term = searchTerm.trim();

	if (!term) {
		return {} as T;
	}

	const OR: Record<string, unknown>[] = [];

	// String fields
	searchableFields.forEach((field) => {
		OR.push({
			[field]: {
				contains: term,
				mode: Prisma.QueryMode.insensitive,
			},
		});
	});

	// Enum fields
	if (enumFields.length > 0) {
		const normalizedSearch = term.toUpperCase();
		enumFields.forEach(({ field, values }) => {
			if (values.includes(normalizedSearch)) {
				OR.push({
					[field]: {
						equals: normalizedSearch,
					},
				});
			}
		});
	}

	// Numeric fields
	if (numericFields.length > 0) {
		const numericValue = Number(term);
		if (!Number.isNaN(numericValue)) {
			numericFields.forEach(({ field }) => {
				OR.push({
					[field]: {
						equals: numericValue,
					},
				});
			});
		}
	}

	return { OR } as T;
};

export default buildSearchCondition;
