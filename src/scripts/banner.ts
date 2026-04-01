type BannerState = {
	bound: boolean;
	cleanup: null | (() => void);
};

const BANNER_STATE_KEY = '__joylifeBannerState';

const getState = () => {
	const windowWithState = window as typeof window & Record<string, unknown>;
	if (!windowWithState[BANNER_STATE_KEY]) {
		windowWithState[BANNER_STATE_KEY] = {
			bound: false,
			cleanup: null,
		} satisfies BannerState;
	}

	return windowWithState[BANNER_STATE_KEY] as BannerState;
};

const mountBanner = () => {
	const state = getState();
	if (typeof state.cleanup === 'function') {
		state.cleanup();
		state.cleanup = null;
	}

	const banner = document.querySelector('[data-banner]');
	if (!(banner instanceof HTMLElement)) return;

	const video = banner.querySelector('[data-banner-video]');
	if (!(video instanceof HTMLVideoElement)) return;

	const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
	const isBackgroundMode = banner.dataset.bannerMode === 'background';
	const coverSpeed = Math.max(
		0.1,
		Number.parseFloat(getComputedStyle(banner).getPropertyValue('--banner-cover-speed')) || 0.38,
	);

	let scrollRaf = 0;
	let maxCoverReveal = 0;

	const syncCoverReveal = () => {
		if (!isBackgroundMode) {
			banner.style.removeProperty('--banner-cover-reveal');
			return;
		}

		const reveal = Math.max(0, Math.min(window.scrollY * coverSpeed, maxCoverReveal));
		banner.style.setProperty('--banner-cover-reveal', `${reveal}px`);
	};

	const measureCoverReveal = () => {
		if (!isBackgroundMode) {
			banner.style.removeProperty('--banner-cover-reveal');
			return;
		}

		const bannerHeight = banner.getBoundingClientRect().height;
		maxCoverReveal = Math.max(0, bannerHeight);
		syncCoverReveal();
	};

	const scheduleCoverReveal = () => {
		if (scrollRaf) return;
		scrollRaf = window.requestAnimationFrame(() => {
			scrollRaf = 0;
			syncCoverReveal();
		});
	};

	const syncVideoState = () => {
		if (document.hidden || reducedMotion.matches) {
			video.pause();
			return;
		}

		void video.play().catch(() => {
			// Autoplay can still be blocked in some browsers; the banner remains usable.
		});
	};

	const handleScroll = () => {
		if (!isBackgroundMode) return;
		scheduleCoverReveal();
	};

	const handleResize = () => {
		if (!isBackgroundMode) return;
		measureCoverReveal();
	};

	const handleVisibilityChange = () => {
		syncVideoState();
		if (!document.hidden && isBackgroundMode) {
			scheduleCoverReveal();
		}
	};

	const handleReducedMotionChange = () => {
		syncVideoState();
	};

	measureCoverReveal();
	syncVideoState();

	window.addEventListener('scroll', handleScroll, { passive: true });
	window.addEventListener('resize', handleResize);
	document.addEventListener('visibilitychange', handleVisibilityChange);
	reducedMotion.addEventListener('change', handleReducedMotionChange);

	state.cleanup = () => {
		if (scrollRaf) {
			window.cancelAnimationFrame(scrollRaf);
			scrollRaf = 0;
		}

		window.removeEventListener('scroll', handleScroll);
		window.removeEventListener('resize', handleResize);
		document.removeEventListener('visibilitychange', handleVisibilityChange);
		reducedMotion.removeEventListener('change', handleReducedMotionChange);
		banner.style.removeProperty('--banner-cover-reveal');
		video.pause();
	};
};

const bindBanner = () => {
	const state = getState();
	if (state.bound) return;

	state.bound = true;
	document.addEventListener('astro:page-load', mountBanner);
	document.addEventListener('astro:before-swap', () => {
		const latestState = getState();
		if (typeof latestState.cleanup === 'function') {
			latestState.cleanup();
			latestState.cleanup = null;
		}
	});
};

bindBanner();
mountBanner();
