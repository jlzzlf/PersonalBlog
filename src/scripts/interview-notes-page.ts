const INTERVIEW_PAGE_STATE_KEY = '__joylifeInterviewPageState';

type InterviewPageState = {
	bound: boolean;
	cleanup: (() => void) | null;
	query: string;
};

type WindowWithInterviewPageState = Window & {
	[INTERVIEW_PAGE_STATE_KEY]?: InterviewPageState;
};

const windowWithState = window as WindowWithInterviewPageState;
const state =
	windowWithState[INTERVIEW_PAGE_STATE_KEY] ??
	(windowWithState[INTERVIEW_PAGE_STATE_KEY] = {
		bound: false,
		cleanup: null,
		query: '',
	});

const normalizeValue = (value = '') =>
	String(value)
		.toLowerCase()
		.replace(/\s+/g, ' ')
		.trim();

const tokenize = (value = '') => normalizeValue(value).split(' ').filter(Boolean);

const setCardVisibility = (card: HTMLElement, visible: boolean) => {
	card.classList.toggle('is-hidden', !visible);
	card.hidden = !visible;
	card.style.display = visible ? '' : 'none';
};

const mountInterviewPage = () => {
	if (typeof state.cleanup === 'function') {
		state.cleanup();
		state.cleanup = null;
	}

	const root = document.querySelector('[data-interview-page]');
	if (!(root instanceof HTMLElement)) return;

	const searchInput = root.querySelector('[data-interview-search]');
	const clearButton = root.querySelector('[data-interview-clear]');
	const status = root.querySelector('[data-interview-status]');
	const summary = root.querySelector('[data-interview-summary]');
	const emptyState = root.querySelector('[data-interview-empty]');
	const cards = Array.from(root.querySelectorAll('[data-interview-card]'));

	if (
		!(searchInput instanceof HTMLInputElement) ||
		!(clearButton instanceof HTMLButtonElement) ||
		!(status instanceof HTMLElement) ||
		!(emptyState instanceof HTMLElement)
	) {
		return;
	}

	let query = typeof state.query === 'string' ? state.query : '';
	searchInput.value = query;

	const syncState = () => {
		state.query = query;
	};

	const applyFilter = () => {
		const tokens = tokenize(query);
		let visibleCount = 0;

		cards.forEach((card) => {
			if (!(card instanceof HTMLElement)) return;

			const searchText = normalizeValue(card.dataset.search || '');
			const matches = tokens.length === 0 || tokens.every((token) => searchText.includes(token));
			setCardVisibility(card, matches);

			if (matches) {
				visibleCount += 1;
			}
		});

		if (summary instanceof HTMLElement) {
			summary.textContent = tokens.length === 0 ? '全部题目' : '关键词搜索中';
		}

		clearButton.hidden = tokens.length === 0;
		status.textContent =
			tokens.length === 0
				? '当前显示全部 ' + visibleCount + ' 道题目。'
				: '当前匹配到 ' + visibleCount + ' 道题目，关键词：' + query + '。';
		emptyState.hidden = visibleCount > 0;
		syncState();
	};

	const handleSearchInput = (event: Event) => {
		const target = event.currentTarget;
		if (!(target instanceof HTMLInputElement)) return;

		query = target.value;
		applyFilter();
	};

	const handleClear = () => {
		query = '';
		searchInput.value = '';
		searchInput.focus();
		applyFilter();
	};

	searchInput.addEventListener('input', handleSearchInput);
	searchInput.addEventListener('search', handleSearchInput);
	searchInput.addEventListener('change', handleSearchInput);
	searchInput.addEventListener('keyup', handleSearchInput);
	clearButton.addEventListener('click', handleClear);

	applyFilter();

	state.cleanup = () => {
		searchInput.removeEventListener('input', handleSearchInput);
		searchInput.removeEventListener('search', handleSearchInput);
		searchInput.removeEventListener('change', handleSearchInput);
		searchInput.removeEventListener('keyup', handleSearchInput);
		clearButton.removeEventListener('click', handleClear);
	};
};

if (!state.bound) {
	state.bound = true;
	document.addEventListener('astro:page-load', mountInterviewPage);
	document.addEventListener('astro:before-swap', () => {
		if (typeof state.cleanup === 'function') {
			state.cleanup();
			state.cleanup = null;
		}
	});
}

mountInterviewPage();
