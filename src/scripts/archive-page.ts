type ArchivePageState = {
	bound: boolean;
	cleanup: null | (() => void);
};

type PostFeedItem = {
	id: string;
	href: string;
	title: string;
	description: string;
	pubDateISO: string;
	archiveDateLabel: string;
	year: string;
	dayKey: string;
};

const ARCHIVE_PAGE_STATE_KEY = '__joylifeArchivePageState';
const ARCHIVE_COUNT_SUFFIX = '\u7bc7\u6587\u7ae0';
const ARCHIVE_EMPTY_TITLE = '\u8fd9\u4e00\u5929\u8fd8\u6ca1\u6709\u5f52\u6863\u5185\u5bb9\u3002';
const ARCHIVE_EMPTY_COPY =
	'\u4f60\u53ef\u4ee5\u6362\u4e00\u5929\u8bd5\u8bd5\u770b\uff0c\u6216\u8005\u518d\u6b21\u70b9\u51fb\u5f53\u524d\u65e5\u671f\u6062\u590d\u5b8c\u6574\u65f6\u95f4\u7ebf\u3002';

const readJsonScript = <T>(root: ParentNode, selector: string, fallback: T): T => {
	const element = root.querySelector(selector);
	if (!(element instanceof HTMLScriptElement)) return fallback;

	try {
		return JSON.parse(element.textContent || '') as T;
	} catch {
		return fallback;
	}
};

const getState = () => {
	const windowWithState = window as typeof window & Record<string, unknown>;
	if (!windowWithState[ARCHIVE_PAGE_STATE_KEY]) {
		windowWithState[ARCHIVE_PAGE_STATE_KEY] = {
			bound: false,
			cleanup: null,
		} satisfies ArchivePageState;
	}

	return windowWithState[ARCHIVE_PAGE_STATE_KEY] as ArchivePageState;
};

const mountArchivePage = () => {
	const state = getState();
	if (typeof state.cleanup === 'function') {
		state.cleanup();
		state.cleanup = null;
	}

	const archivePage = document.querySelector('[data-archive-page]');
	if (!(archivePage instanceof HTMLElement)) return;

	const archiveTimeline = archivePage.querySelector('[data-archive-timeline]');
	const archiveCount = archivePage.querySelector('[data-archive-count]');
	const calendarMonthLabel = archivePage.querySelector('[data-calendar-month-label]');
	const calendarGrid = archivePage.querySelector('[data-calendar-grid]');

	if (
		!(archiveTimeline instanceof HTMLElement) ||
		!(archiveCount instanceof HTMLElement) ||
		!(calendarMonthLabel instanceof HTMLElement) ||
		!(calendarGrid instanceof HTMLElement)
	) {
		return;
	}

	const postFeedItems = readJsonScript<PostFeedItem[]>(archivePage, '[data-post-feed]', []);

	let selectedDayKey = '';
	let calendarMonthKey = '';
	let calendarDayButtons: HTMLButtonElement[] = [];

	const toDayKey = (date: Date) =>
		`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
			date.getDate(),
		).padStart(2, '0')}`;

	const toMonthKey = (date: Date) =>
		`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

	const calendarMonthFormatter = new Intl.DateTimeFormat('zh-CN', {
		year: 'numeric',
		month: 'long',
	});

	const groupArchiveItemsByYear = (items: PostFeedItem[]) =>
		Array.from(
			items.reduce((groups, item) => {
				const yearItems = groups.get(item.year);
				if (yearItems) {
					yearItems.push(item);
				} else {
					groups.set(item.year, [item]);
				}
				return groups;
			}, new Map<string, PostFeedItem[]>()),
		).map(([year, yearItems]) => ({ year, items: yearItems }));

	const createArchiveItem = (item: PostFeedItem) => {
		const link = document.createElement('a');
		link.className = 'archive-item';
		link.href = item.href;

		const time = document.createElement('time');
		time.className = 'archive-date';
		time.dateTime = item.pubDateISO;
		time.textContent = item.archiveDateLabel;

		const body = document.createElement('div');
		body.className = 'archive-item-body';

		const title = document.createElement('strong');
		title.textContent = item.title;

		const description = document.createElement('p');
		description.textContent = item.description;

		body.append(title, description);
		link.append(time, body);
		return link;
	};

	const renderArchiveItems = () => {
		const filteredItems = selectedDayKey
			? postFeedItems.filter((item) => item.dayKey === selectedDayKey)
			: postFeedItems;

		archiveCount.textContent = `${filteredItems.length} ${ARCHIVE_COUNT_SUFFIX}`;

		if (!filteredItems.length) {
			const emptyState = document.createElement('div');
			emptyState.className = 'archive-empty';

			const title = document.createElement('h3');
			title.textContent = ARCHIVE_EMPTY_TITLE;

			const copy = document.createElement('p');
			copy.textContent = ARCHIVE_EMPTY_COPY;

			emptyState.append(title, copy);
			archiveTimeline.replaceChildren(emptyState);
			return;
		}

		const fragment = document.createDocumentFragment();
		const groups = groupArchiveItemsByYear(filteredItems);

		groups.forEach((group) => {
			const section = document.createElement('section');
			section.className = 'archive-group';

			const year = document.createElement('div');
			year.className = 'archive-year';
			year.textContent = group.year;

			const items = document.createElement('div');
			items.className = 'archive-items';
			group.items.forEach((item) => {
				items.append(createArchiveItem(item));
			});

			section.append(year, items);
			fragment.append(section);
		});

		archiveTimeline.replaceChildren(fragment);
	};

	const syncCalendarSelection = () => {
		const today = new Date();
		const todayDayKey = toDayKey(today);

		calendarDayButtons.forEach((button) => {
			const isSelected = button.dataset.dayKey === selectedDayKey;
			button.classList.toggle('selected', isSelected);
			button.setAttribute('aria-pressed', String(isSelected));

			const shouldHighlightToday = !selectedDayKey && button.dataset.dayKey === todayDayKey;
			button.classList.toggle('today', shouldHighlightToday);
		});
	};

	function handleCalendarSelection(event: Event) {
		const button = event.currentTarget;
		if (!(button instanceof HTMLElement)) return;

		const dayKey = button.dataset.dayKey || '';
		selectedDayKey = selectedDayKey === dayKey ? '' : dayKey;
		syncCalendarSelection();
		renderArchiveItems();
	}

	const renderCalendarCurrentMonth = () => {
		const today = new Date();
		const currentYear = today.getFullYear();
		const currentMonth = today.getMonth();
		const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
		const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
		const leadingEmptyDays = (firstDayOfMonth.getDay() + 6) % 7;

		calendarMonthKey = toMonthKey(today);
		if (selectedDayKey && !selectedDayKey.startsWith(`${calendarMonthKey}-`)) {
			selectedDayKey = '';
			renderArchiveItems();
		}

		calendarMonthLabel.textContent = calendarMonthFormatter.format(today);

		calendarDayButtons.forEach((button) => {
			button.removeEventListener('click', handleCalendarSelection);
		});
		calendarDayButtons = [];
		calendarGrid.textContent = '';

		const fragment = document.createDocumentFragment();
		for (let index = 0; index < leadingEmptyDays; index += 1) {
			const emptyCell = document.createElement('div');
			emptyCell.className = 'calendar-day empty';
			fragment.append(emptyCell);
		}

		for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber += 1) {
			const button = document.createElement('button');
			button.type = 'button';
			button.className = 'calendar-day';
			button.dataset.calendarDay = '';
			button.dataset.dayKey = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(
				dayNumber,
			).padStart(2, '0')}`;
			button.setAttribute('aria-pressed', 'false');
			button.textContent = String(dayNumber);
			button.addEventListener('click', handleCalendarSelection);
			calendarDayButtons.push(button);
			fragment.append(button);
		}

		let renderedCells = leadingEmptyDays + daysInMonth;
		while (renderedCells % 7 !== 0) {
			const emptyCell = document.createElement('div');
			emptyCell.className = 'calendar-day empty';
			fragment.append(emptyCell);
			renderedCells += 1;
		}

		calendarGrid.append(fragment);
		syncCalendarSelection();
	};

	renderArchiveItems();
	renderCalendarCurrentMonth();

	state.cleanup = () => {
		calendarDayButtons.forEach((button) => {
			button.removeEventListener('click', handleCalendarSelection);
		});
	};
};

const bindArchivePage = () => {
	const state = getState();
	if (state.bound) return;

	state.bound = true;
	document.addEventListener('astro:page-load', mountArchivePage);
	document.addEventListener('astro:before-swap', () => {
		const latestState = getState();
		if (typeof latestState.cleanup === 'function') {
			latestState.cleanup();
			latestState.cleanup = null;
		}
	});
	window.addEventListener('pageshow', (event) => {
		if (event.persisted) {
			mountArchivePage();
		}
	});
};

bindArchivePage();
mountArchivePage();
