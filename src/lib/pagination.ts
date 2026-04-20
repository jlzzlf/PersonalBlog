export const BLOG_PAGE_SIZE = 8;
export const PROJECT_PAGE_SIZE = 6;
export const INTERVIEW_PAGE_SIZE = 8;

export type PaginatedSlice<T> = {
	items: T[];
	totalItems: number;
	totalPages: number;
	currentPage: number;
};

export const paginateItems = <T>(items: T[], pageSize: number, currentPage: number): PaginatedSlice<T> => {
	const totalItems = items.length;
	const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
	const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages);
	const startIndex = (safeCurrentPage - 1) * pageSize;

	return {
		items: items.slice(startIndex, startIndex + pageSize),
		totalItems,
		totalPages,
		currentPage: safeCurrentPage,
	};
};

export const buildPaginatedPath = (basePath: string, page: number) =>
	page <= 1 ? `${basePath}/` : `${basePath}/page/${page}/`;

export const buildPaginationSequence = (currentPage: number, totalPages: number) => {
	if (totalPages <= 1) return [1];

	const pages = new Set<number>([1, totalPages, currentPage]);
	for (let offset = 1; offset <= 2; offset += 1) {
		if (currentPage - offset > 1) {
			pages.add(currentPage - offset);
		}
		if (currentPage + offset < totalPages) {
			pages.add(currentPage + offset);
		}
	}

	const sortedPages = Array.from(pages).sort((first, second) => first - second);
	const sequence: Array<number | 'ellipsis'> = [];

	for (let index = 0; index < sortedPages.length; index += 1) {
		const page = sortedPages[index];
		const previousPage = sortedPages[index - 1];
		if (previousPage && page - previousPage > 1) {
			sequence.push('ellipsis');
		}
		sequence.push(page);
	}

	return sequence;
};
