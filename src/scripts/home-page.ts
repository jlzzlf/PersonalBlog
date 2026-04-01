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

	state.cleanup = () => {
		if (clockTimer) {
			window.clearInterval(clockTimer);
			clockTimer = 0;
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
