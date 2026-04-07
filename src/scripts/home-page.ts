type HomePageState = {
	bound: boolean;
	cleanup: null | (() => void);
};

const HOME_PAGE_STATE_KEY = '__joylifeHomePageClockState';

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

	const cleanupHandlers: Array<() => void> = [];
	const statAnimationFrames = new Set<number>();

	const refreshHomeLayout = () => {
		home.getBoundingClientRect();
		window.requestAnimationFrame(() => {
			window.dispatchEvent(new Event('resize'));
		});
	};

	refreshHomeLayout();

	let clockTimer = 0;
	const currentTime = home.querySelector('[data-current-time]');
	if (currentTime instanceof HTMLElement) {
		const updateClock = () => {
			currentTime.textContent = new Intl.DateTimeFormat('zh-CN', {
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
				hour12: false,
			}).format(new Date());
		};

		updateClock();

		clockTimer = window.setInterval(() => {
			if (!document.hidden) {
				updateClock();
			}
		}, 1000);
	}

	const revealTargets = Array.from(home.querySelectorAll('[data-reveal-card]'));
	let revealObserver: IntersectionObserver | null = null;
	if ('IntersectionObserver' in window) {
		revealObserver = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (!entry.isIntersecting) continue;
					if (entry.target instanceof HTMLElement) {
						entry.target.classList.add('is-visible');
					}
					revealObserver?.unobserve(entry.target);
				}
			},
			{ threshold: 0.1 },
		);

		for (const target of revealTargets) {
			revealObserver.observe(target);
		}
	} else {
		for (const target of revealTargets) {
			if (target instanceof HTMLElement) {
				target.classList.add('is-visible');
			}
		}
	}

	const animateStat = (element: HTMLElement) => {
		const targetRaw = element.dataset.statCount;
		if (!targetRaw || element.dataset.statAnimated === 'true') return;

		const target = Number.parseFloat(targetRaw);
		if (!Number.isFinite(target)) return;

		element.dataset.statAnimated = 'true';
		const precision = Math.max(0, Number.parseInt(element.dataset.statPrecision ?? '0', 10) || 0);
		const duration = 2000;
		const start = performance.now();

		const tick = (time: number) => {
			const progress = Math.min(1, (time - start) / duration);
			const eased = 1 - Math.pow(1 - progress, 3);
			const nextValue = target * eased;
			element.textContent = precision > 0 ? nextValue.toFixed(precision) : String(Math.floor(nextValue));

			if (progress < 1) {
				const animationFrame = window.requestAnimationFrame(tick);
				statAnimationFrames.add(animationFrame);
			} else {
				element.textContent = precision > 0 ? target.toFixed(precision) : String(Math.round(target));
			}
		};

		const animationFrame = window.requestAnimationFrame(tick);
		statAnimationFrames.add(animationFrame);
	};

	const statCards = Array.from(home.querySelectorAll('[data-stat-card]'));
	let statObserver: IntersectionObserver | null = null;
	if ('IntersectionObserver' in window) {
		statObserver = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (!entry.isIntersecting || !(entry.target instanceof HTMLElement)) continue;
					const counters = entry.target.querySelectorAll('[data-stat-count]');
					for (const counter of counters) {
						if (counter instanceof HTMLElement) {
							animateStat(counter);
						}
					}
					statObserver?.unobserve(entry.target);
				}
			},
			{ threshold: 0.35 },
		);

		for (const card of statCards) {
			statObserver.observe(card);
		}
	} else {
		for (const counter of home.querySelectorAll('[data-stat-count]')) {
			if (counter instanceof HTMLElement) {
				animateStat(counter);
			}
		}
	}

	const copyButtons = Array.from(home.querySelectorAll('[data-copy-text]'));
	for (const button of copyButtons) {
		if (!(button instanceof HTMLButtonElement)) continue;

		const originalText = button.textContent ?? '';
		let resetTimer = 0;
		const handleClick = async () => {
			const copyText = button.dataset.copyText ?? '';
			if (!copyText) return;

			try {
				await navigator.clipboard.writeText(copyText);
				button.textContent = '已复制';
				button.classList.add('is-copied');
			} catch {
				button.textContent = '复制失败';
				button.classList.add('is-copied');
			}

			if (resetTimer) {
				window.clearTimeout(resetTimer);
			}

			resetTimer = window.setTimeout(() => {
				button.textContent = originalText;
				button.classList.remove('is-copied');
				resetTimer = 0;
			}, 1600);
		};

		button.addEventListener('click', handleClick);
		cleanupHandlers.push(() => {
			button.removeEventListener('click', handleClick);
			if (resetTimer) {
				window.clearTimeout(resetTimer);
				resetTimer = 0;
			}
			button.textContent = originalText;
			button.classList.remove('is-copied');
		});
	}

	state.cleanup = () => {
		if (clockTimer) {
			window.clearInterval(clockTimer);
			clockTimer = 0;
		}

		revealObserver?.disconnect();
		statObserver?.disconnect();

		for (const animationFrame of statAnimationFrames) {
			window.cancelAnimationFrame(animationFrame);
		}
		statAnimationFrames.clear();

		for (const cleanupHandler of cleanupHandlers) {
			cleanupHandler();
		}
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
	window.addEventListener('pageshow', (event) => {
		if (event.persisted) {
			mountHomePage();
		}
	});
};

bindHomePage();
mountHomePage();
