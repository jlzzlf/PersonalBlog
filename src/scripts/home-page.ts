type HomePageState = {
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

const HOME_PAGE_STATE_KEY = '__joylifeHomePageState';
const ARCHIVE_COUNT_SUFFIX = '\u7bc7\u6587\u7ae0';
const ARCHIVE_EMPTY_TITLE = '\u8fd9\u4e00\u5929\u8fd8\u6ca1\u6709\u5f52\u6863\u5185\u5bb9\u3002';
const ARCHIVE_EMPTY_COPY =
	'\u4f60\u53ef\u4ee5\u6362\u4e00\u5929\u8bd5\u8bd5\u770b\uff0c\u6216\u8005\u518d\u6b21\u70b9\u51fb\u5f53\u524d\u65e5\u671f\u6062\u590d\u5b8c\u6574\u65f6\u95f4\u7ebf\u3002';

const clamp = (min: number, value: number, max: number) => Math.min(Math.max(value, min), max);

const readRem = () =>
	parseFloat(getComputedStyle(document.documentElement).fontSize || '16') || 16;

const readJsonScript = <T>(root: ParentNode, selector: string, fallback: T): T => {
	const element = root.querySelector(selector);
	if (!(element instanceof HTMLScriptElement)) return fallback;

	try {
		return JSON.parse(element.textContent || '') as T;
	} catch {
		return fallback;
	}
};

const getConnectionInfo = () => {
	const navigatorWithConnection = navigator as Navigator & {
		connection?: { saveData?: boolean; effectiveType?: string };
	};
	const connection = navigatorWithConnection.connection;
	const effectiveType = connection?.effectiveType || '';

	return {
		saveData: Boolean(connection?.saveData),
		slowNetwork: effectiveType === 'slow-2g' || effectiveType === '2g',
	};
};

const getState = () => {
	const windowWithState = window as typeof window & Record<string, unknown>;
	if (!windowWithState[HOME_PAGE_STATE_KEY]) {
		windowWithState[HOME_PAGE_STATE_KEY] = {
			bound: false,
			cleanup: null,
		} satisfies HomePageState;
	}

	return windowWithState[HOME_PAGE_STATE_KEY] as HomePageState;
};

const mountHomePage = () => {
	const state = getState();
	if (typeof state.cleanup === 'function') {
		state.cleanup();
		state.cleanup = null;
	}

	const home = document.querySelector('[data-parallax-home]');
	if (!(home instanceof HTMLElement)) return;

	const heroSubtitle = home.querySelector('[data-random-hero-subtitle]');
	const currentTime = home.querySelector('[data-current-time]');
	const archiveTimeline = home.querySelector('[data-archive-timeline]');
	const archiveCount = home.querySelector('[data-archive-count]');
	const calendarDayButtons = Array.from(home.querySelectorAll('[data-calendar-day]'));
	const videoLayer = home.querySelector('.home-video-layer');
	const surfaceLayer = home.querySelector('.home-surface-layer');
	const stage = home.querySelector('.home-stage');
	const dashboardLayer = home.querySelector('.dashboard-layer');
	const stageVideo = home.querySelector('.stage-video');

	if (
		!(videoLayer instanceof HTMLElement) ||
		!(surfaceLayer instanceof HTMLElement) ||
		!(stage instanceof HTMLElement) ||
		!(dashboardLayer instanceof HTMLElement)
	) {
		return;
	}

	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
	const postFeedItems = readJsonScript<PostFeedItem[]>(home, '[data-post-feed]', []);
	const heroQuotes = readJsonScript<string[]>(home, '[data-hero-quotes]', []);

	let selectedDayKey = '';
	let layoutFrame = 0;
	let subtitleFrame = 0;
	let clockTimer = 0;
	let idleVideoHandle = 0;
	let isActive = true;

	const canUseHeroMedia = () => {
		const { saveData, slowNetwork } = getConnectionInfo();
		return !reducedMotion.matches && window.innerWidth > 860 && !saveData && !slowNetwork;
	};

	const getLayoutValues = () => {
		const rem = readRem();
		const width = window.innerWidth;
		const heroHeight = width <= 720 ? 17 * rem : clamp(2.5 * rem, width * 0.83, 39 * rem);

		let heroOverlap;
		if (width <= 860) {
			heroOverlap = clamp(1.75 * rem, heroHeight * 0.1, 3 * rem);
		} else if (width <= 1040) {
			heroOverlap = clamp(3 * rem, heroHeight * 0.12, 5 * rem);
		} else {
			heroOverlap = clamp(1.5 * rem, heroHeight * 0.33, 15 * rem);
		}

		return {
			heroHeight,
			heroOverlap,
			surfaceOverlap: clamp(0, width * 0.014, 1 * rem),
		};
	};

	const applyLayout = (scrollY: number) => {
		const { heroHeight, heroOverlap, surfaceOverlap } = getLayoutValues();
		const surfaceShift = reducedMotion.matches
			? 0
			: clamp(heroHeight * -1, scrollY * -0.6, 0);

		videoLayer.style.height = `${heroHeight}px`;
		stage.style.height = `${heroHeight}px`;
		surfaceLayer.style.top = `${heroHeight - surfaceOverlap}px`;
		surfaceLayer.style.transform = `translate3d(-50%, ${surfaceShift}px, 0)`;
		dashboardLayer.style.marginTop = `${heroOverlap * -1}px`;
	};

	const fitHeroSubtitle = () => {
		if (!(heroSubtitle instanceof HTMLElement)) return;

		heroSubtitle.style.fontSize = '';
		heroSubtitle.style.letterSpacing = '';

		const rem = readRem();
		const maxWidth = Math.max(
			Math.min(stage.clientWidth || window.innerWidth, window.innerWidth) - 32,
			0,
		);

		if (!maxWidth) return;

		const minSize = window.innerWidth <= 720 ? 1.05 * rem : 1.45 * rem;
		let fontSize = parseFloat(getComputedStyle(heroSubtitle).fontSize || '0');

		while (heroSubtitle.scrollWidth > maxWidth && fontSize > minSize) {
			fontSize -= 1;
			heroSubtitle.style.fontSize = `${fontSize}px`;
		}

		if (heroSubtitle.scrollWidth > maxWidth) {
			heroSubtitle.style.letterSpacing = '-0.04em';
		}
	};

	const requestSubtitleFit = () => {
		if (subtitleFrame) return;
		subtitleFrame = window.requestAnimationFrame(() => {
			subtitleFrame = 0;
			fitHeroSubtitle();
		});
	};

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
		if (!(archiveTimeline instanceof HTMLElement) || !(archiveCount instanceof HTMLElement)) {
			return;
		}

		const filteredItems = selectedDayKey
			? postFeedItems.filter((item) => item.dayKey === selectedDayKey)
			: postFeedItems;

		archiveTimeline.textContent = '';
		archiveCount.textContent = `${filteredItems.length} ${ARCHIVE_COUNT_SUFFIX}`;

		if (!filteredItems.length) {
			const emptyState = document.createElement('div');
			emptyState.className = 'archive-empty';

			const title = document.createElement('h3');
			title.textContent = ARCHIVE_EMPTY_TITLE;

			const copy = document.createElement('p');
			copy.textContent = ARCHIVE_EMPTY_COPY;

			emptyState.append(title, copy);
			archiveTimeline.append(emptyState);
			return;
		}

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
			archiveTimeline.append(section);
		});
	};

	const syncCalendarSelection = () => {
		const today = new Date();
		const todayDayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
			today.getDate(),
		).padStart(2, '0')}`;

		calendarDayButtons.forEach((button) => {
			if (!(button instanceof HTMLElement)) return;
			const isSelected = button.dataset.dayKey === selectedDayKey;
			button.classList.toggle('selected', isSelected);
			button.setAttribute('aria-pressed', String(isSelected));

			const shouldHighlightToday = !selectedDayKey && button.dataset.dayKey === todayDayKey;
			button.classList.toggle('today', shouldHighlightToday);
		});
	};

	const updateClock = () => {
		if (!(currentTime instanceof HTMLElement)) return;
		currentTime.textContent = new Intl.DateTimeFormat('zh-CN', {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			hour12: false,
		}).format(new Date());
	};

	const applyRandomHeroSubtitle = () => {
		if (!(heroSubtitle instanceof HTMLElement) || heroQuotes.length === 0) return;
		heroSubtitle.textContent = heroQuotes[Math.floor(Math.random() * heroQuotes.length)];
		requestSubtitleFit();
	};

	const requestLayoutUpdate = () => {
		if (layoutFrame) return;
		layoutFrame = window.requestAnimationFrame(() => {
			layoutFrame = 0;
			applyLayout(Math.max(window.scrollY || 0, 0));
		});
	};

	const cancelPendingVideoLoad = () => {
		if (!idleVideoHandle) return;

		const windowWithIdle = window as typeof window & {
			cancelIdleCallback?: (handle: number) => void;
		};

		if (typeof windowWithIdle.cancelIdleCallback === 'function') {
			windowWithIdle.cancelIdleCallback(idleVideoHandle);
		} else {
			window.clearTimeout(idleVideoHandle);
		}

		idleVideoHandle = 0;
	};

	const syncHeroVideo = () => {
		if (!(stageVideo instanceof HTMLVideoElement)) return;

		if (!canUseHeroMedia()) {
			cancelPendingVideoLoad();
			if (stageVideo.dataset.loaded === 'true') {
				stageVideo.pause();
				stageVideo.removeAttribute('src');
				stageVideo.load();
				stageVideo.dataset.loaded = 'false';
			}
			stageVideo.classList.remove('is-ready');
			return;
		}

		if (stageVideo.dataset.loaded === 'true' || idleVideoHandle) return;

		const activateVideo = () => {
			idleVideoHandle = 0;
			if (!isActive || !canUseHeroMedia() || stageVideo.dataset.loaded === 'true') return;

			const videoSrc = stageVideo.dataset.videoSrc;
			if (!videoSrc) return;

			const handleLoadedData = () => {
				stageVideo.classList.add('is-ready');
				stageVideo.removeEventListener('loadeddata', handleLoadedData);
			};

			stageVideo.addEventListener('loadeddata', handleLoadedData);
			stageVideo.src = videoSrc;
			stageVideo.dataset.loaded = 'true';
			stageVideo.load();
			void stageVideo.play().catch(() => {
				// Ignore autoplay failures; the muted loop is a progressive enhancement.
			});
		};

		const windowWithIdle = window as typeof window & {
			requestIdleCallback?: (
				callback: () => void,
				options?: { timeout?: number },
			) => number;
		};

		if (typeof windowWithIdle.requestIdleCallback === 'function') {
			idleVideoHandle = windowWithIdle.requestIdleCallback(activateVideo, { timeout: 1800 });
		} else {
			idleVideoHandle = window.setTimeout(activateVideo, 350);
		}
	};

	const handleCalendarSelection = (event: Event) => {
		const button = event.currentTarget;
		if (!(button instanceof HTMLElement)) return;

		const dayKey = button.dataset.dayKey || '';
		selectedDayKey = selectedDayKey === dayKey ? '' : dayKey;
		syncCalendarSelection();
		renderArchiveItems();
	};

	const handleWindowLoad = () => {
		requestSubtitleFit();
		syncHeroVideo();
	};

	const handleResize = () => {
		requestLayoutUpdate();
		requestSubtitleFit();
		syncHeroVideo();
	};

	const handleReducedMotionChange = () => {
		requestLayoutUpdate();
		syncHeroVideo();
	};

	const handleVisibilityChange = () => {
		if (document.hidden) {
			if (stageVideo instanceof HTMLVideoElement) {
				stageVideo.pause();
			}
			return;
		}

		if (stageVideo instanceof HTMLVideoElement && stageVideo.dataset.loaded === 'true') {
			void stageVideo.play().catch(() => {
				// Ignore autoplay failures after tab restore.
			});
		}
	};

	const removeReducedMotionListener = (() => {
		if (typeof reducedMotion.addEventListener === 'function') {
			reducedMotion.addEventListener('change', handleReducedMotionChange);
			return () => {
				reducedMotion.removeEventListener('change', handleReducedMotionChange);
			};
		}

		if (typeof reducedMotion.addListener === 'function') {
			reducedMotion.addListener(handleReducedMotionChange);
			return () => {
				reducedMotion.removeListener(handleReducedMotionChange);
			};
		}

		return () => {};
	})();

	applyRandomHeroSubtitle();
	requestSubtitleFit();
	updateClock();
	clockTimer = window.setInterval(() => {
		if (!document.hidden) {
			updateClock();
		}
	}, 1000);
	syncCalendarSelection();
	requestLayoutUpdate();
	syncHeroVideo();

	calendarDayButtons.forEach((button) => {
		button.addEventListener('click', handleCalendarSelection);
	});

	window.addEventListener('scroll', requestLayoutUpdate, { passive: true });
	window.addEventListener('resize', handleResize);
	window.addEventListener('load', handleWindowLoad, { once: true });
	document.addEventListener('visibilitychange', handleVisibilityChange);

	state.cleanup = () => {
		isActive = false;

		if (clockTimer) {
			window.clearInterval(clockTimer);
			clockTimer = 0;
		}
		if (layoutFrame) {
			window.cancelAnimationFrame(layoutFrame);
			layoutFrame = 0;
		}
		if (subtitleFrame) {
			window.cancelAnimationFrame(subtitleFrame);
			subtitleFrame = 0;
		}

		cancelPendingVideoLoad();

		calendarDayButtons.forEach((button) => {
			button.removeEventListener('click', handleCalendarSelection);
		});

		window.removeEventListener('scroll', requestLayoutUpdate);
		window.removeEventListener('resize', handleResize);
		window.removeEventListener('load', handleWindowLoad);
		document.removeEventListener('visibilitychange', handleVisibilityChange);
		removeReducedMotionListener();
	};
};

const bindHomePage = () => {
	const state = getState();
	if (state.bound) return;

	state.bound = true;
	document.addEventListener('astro:page-load', mountHomePage);
	document.addEventListener('astro:before-swap', () => {
		const latestState = getState();
		if (typeof latestState.cleanup === 'function') {
			latestState.cleanup();
			latestState.cleanup = null;
		}
	});
};

bindHomePage();
mountHomePage();
