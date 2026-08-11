import type { TQueryFilter } from "../types";

const buildFilterableField = (
	queryFilter: TQueryFilter,
	filterableFields: readonly string[],
) => {
	const AND = Object.entries(queryFilter)
		.filter(
			([key, value]) =>
				filterableFields.includes(key) &&
				value !== undefined &&
				(Array.isArray(value) ? value.length > 0 : value.trim() !== ""),
		)
		.map(([key, value]) => {
			if (Array.isArray(value)) {
				return {
					[key]: { in: value },
				};
			}
			return { [key]: value };
		});

	return { AND };
};

export default buildFilterableField;
