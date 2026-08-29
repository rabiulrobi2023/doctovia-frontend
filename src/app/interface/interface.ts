
export interface IPaginationOptions {
	page: string | number;
	limit: string | number;
	sortBy: string;
	sortOrder: "asc" | "desc";
}

export interface IPagination {
	page: number;
	limit: number;
	skip: number;
	sortBy: string;
	sortOrder: "asc" | "desc";
}

export interface IMetaData {
	page: number;
	limit: number;
	skip: number;
	total: number;
	totalPage: number;
}

export interface IErrorSource {
	path: string;
	message: string;
}
