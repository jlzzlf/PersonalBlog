type MusicTrack = {
	key?: string;
	label?: string;
	src: string;
};

type StoredPlayerState = {
	hasVisited?: boolean;
	index?: number;
	src?: string;
	label?: string;
	currentTime?: number;
	paused?: boolean;
	expanded?: boolean;
	volume?: number;
};

type StoredTrackCache = {
	fetchedAt?: number;
	tracks?: MusicTrack[];
};

type PendingAction = 'expand' | 'play' | 'previous' | 'next' | null;

const STORAGE_KEY = 'joylife-floating-music-player';
const TRACK_CACHE_KEY = 'joylife-floating-music-tracks';
const TRACK_CACHE_TTL = 1000 * 60 * 60 * 12;
const DEFAULT_VOLUME = 0.15;
const UNNAMED_TRACK = '\u672a\u547d\u540d\u97f3\u4e50';
const NO_MUSIC = '\u6682\u65e0\u97f3\u4e50';
const LOAD_FAILED = '\u97f3\u4e50\u52a0\u8f7d\u5931\u8d25';
const PLAY_LABEL = '\u64ad\u653e';
const PAUSE_LABEL = '\u6682\u505c';
const VOLUME_LABEL = '\u97f3\u91cf';

const PLAY_ICON =
	'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.75 6.78c0-.83.92-1.33 1.62-.88l7.1 4.72a1.06 1.06 0 0 1 0 1.76l-7.1 4.72a1.06 1.06 0 0 1-1.62-.88V6.78Z" fill="currentColor" /></svg>';
const PAUSE_ICON =
	'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 6.5a1 1 0 0 1 1 1v9a1 1 0 1 1-2 0v-9a1 1 0 0 1 1-1Zm7 0a1 1 0 0 1 1 1v9a1 1 0 1 1-2 0v-9a1 1 0 0 1 1-1Z" fill="currentColor" /></svg>';

const root = document.querySelector('[data-floating-music-player]');
if (!(root instanceof HTMLElement) || root.dataset.initialized === 'true') {
	// The player persists across route transitions, so only initialize once.
} else {
	root.dataset.initialized = 'true';

	const toggleButton = root.querySelector('[data-player-toggle]');
	const panel = root.querySelector('[data-player-panel]');
	const audio = root.querySelector('[data-player-audio]');
	const currentLabel = root.querySelector('[data-player-current]');
	const volumeSlider = root.querySelector('[data-player-volume]');
	const previousButton = root.querySelector('[data-player-previous]');
	const playButton = root.querySelector('[data-player-play]');
	const nextButton = root.querySelector('[data-player-next]');

	if (
		!(toggleButton instanceof HTMLButtonElement) ||
		!(panel instanceof HTMLElement) ||
		!(audio instanceof HTMLAudioElement) ||
		!(currentLabel instanceof HTMLElement) ||
		!(volumeSlider instanceof HTMLInputElement) ||
		!(previousButton instanceof HTMLButtonElement) ||
		!(playButton instanceof HTMLButtonElement) ||
		!(nextButton instanceof HTMLButtonElement)
	) {
		throw new Error('Floating music player markup is incomplete.');
	}

	let musicTracks: MusicTrack[] = [];
	let activeMusicTrackIndex = 0;
	let pendingRestoreTime = 0;
	let pendingAutoplay = false;
	let pendingAutoplayRetry = false;
	let lastPersistAt = 0;
	let loadPromise: Promise<void> | null = null;
	let pendingAction: PendingAction = null;

	const readStoredState = (): StoredPlayerState | null => {
		try {
			const raw = window.localStorage.getItem(STORAGE_KEY);
			if (!raw) return null;
			const parsed = JSON.parse(raw);
			return parsed && typeof parsed === 'object' ? (parsed as StoredPlayerState) : null;
		} catch {
			return null;
		}
	};

	const persistPlayerState = () => {
		if (!musicTracks.length) return;
		const activeTrack = musicTracks[activeMusicTrackIndex];
		if (!activeTrack || typeof activeTrack !== 'object') return;

		try {
			window.localStorage.setItem(
				STORAGE_KEY,
				JSON.stringify({
					hasVisited: true,
					index: activeMusicTrackIndex,
					src: activeTrack.src || '',
					label: activeTrack.label || '',
					currentTime: Number.isFinite(audio.currentTime) ? audio.currentTime : 0,
					paused: audio.paused,
					expanded: root.dataset.expanded === 'true',
					volume: Number.isFinite(audio.volume) ? audio.volume : DEFAULT_VOLUME,
				}),
			);
		} catch {
			// Ignore storage issues.
		}
	};

	const readTrackCache = () => {
		try {
			const raw = window.localStorage.getItem(TRACK_CACHE_KEY);
			if (!raw) return null;

			const parsed = JSON.parse(raw) as StoredTrackCache;
			const tracks = Array.isArray(parsed?.tracks)
				? parsed.tracks.filter(
						(track): track is MusicTrack =>
							Boolean(track) && typeof track.src === 'string' && track.src.length > 0,
					)
				: [];

			if (tracks.length === 0) return null;

			return {
				tracks,
				stale:
					typeof parsed.fetchedAt !== 'number' ||
					Date.now() - parsed.fetchedAt > TRACK_CACHE_TTL,
			};
		} catch {
			return null;
		}
	};

	const persistTrackCache = (tracks: MusicTrack[]) => {
		try {
			window.localStorage.setItem(
				TRACK_CACHE_KEY,
				JSON.stringify({
					fetchedAt: Date.now(),
					tracks,
				}),
			);
		} catch {
			// Ignore storage issues.
		}
	};

	const setControlsDisabled = (disabled: boolean) => {
		volumeSlider.disabled = disabled;
		previousButton.disabled = disabled;
		playButton.disabled = disabled;
		nextButton.disabled = disabled;
	};

	const setPlayButtonState = (isPlaying: boolean) => {
		playButton.innerHTML = isPlaying ? PAUSE_ICON : PLAY_ICON;
		playButton.setAttribute('aria-label', isPlaying ? PAUSE_LABEL : PLAY_LABEL);
		root.dataset.playing = isPlaying ? 'true' : 'false';
	};

	const setVolumeSliderState = (volume: number) => {
		const safeVolume = Math.max(0, Math.min(volume, 1));
		volumeSlider.value = String(Math.round(safeVolume * 100));
		volumeSlider.setAttribute('aria-label', `${VOLUME_LABEL} ${Math.round(safeVolume * 100)}%`);
	};

	const applyVolume = (volume: number, { persist = true } = {}) => {
		const safeVolume = Math.max(0, Math.min(volume, 1));
		audio.volume = safeVolume;
		setVolumeSliderState(safeVolume);
		if (persist) {
			persistPlayerState();
		}
	};

	const setExpanded = (expanded: boolean, { persist = true } = {}) => {
		const nextExpanded = expanded && musicTracks.length > 0;
		root.dataset.expanded = nextExpanded ? 'true' : 'false';
		toggleButton.setAttribute('aria-expanded', String(nextExpanded));
		panel.setAttribute('aria-hidden', String(!nextExpanded));

		if (persist) {
			persistPlayerState();
		}
	};

	const setReadyState = (ready: boolean) => {
		root.dataset.ready = ready ? 'true' : 'false';
		root.dataset.loading = 'false';
		if (ready) {
			panel.hidden = false;
			setControlsDisabled(false);
			return;
		}

		setControlsDisabled(true);
		setExpanded(false, { persist: false });
	};

	const setCurrentTrackLabel = (track: MusicTrack | undefined) => {
		const label = track?.label || UNNAMED_TRACK;
		currentLabel.textContent = label;
		currentLabel.title = label;
	};

	const scheduleAutoplayRetry = () => {
		if (pendingAutoplayRetry) return;
		pendingAutoplayRetry = true;

		const resumePlayback = () => {
			pendingAutoplayRetry = false;
			window.removeEventListener('pointerdown', resumePlayback);
			window.removeEventListener('keydown', resumePlayback);

			if (!audio.getAttribute('src')) return;
			void audio.play().catch(() => {
				// Ignore repeated autoplay blocks.
			});
		};

		window.addEventListener('pointerdown', resumePlayback, { once: true, passive: true });
		window.addEventListener('keydown', resumePlayback, { once: true });
	};

	const setActiveMusicTrack = (
		index: number,
		{ autoplay = false, restoreTime = 0 } = {},
	) => {
		if (!musicTracks.length || index < 0 || index >= musicTracks.length) return;

		const nextTrack = musicTracks[index];
		if (!nextTrack || typeof nextTrack.src !== 'string' || !nextTrack.src) return;

		activeMusicTrackIndex = index;
		setCurrentTrackLabel(nextTrack);
		pendingRestoreTime = Math.max(restoreTime, 0);
		pendingAutoplay = autoplay;
		setPlayButtonState(false);

		if (audio.getAttribute('src') !== nextTrack.src) {
			audio.src = nextTrack.src;
			audio.load();
		} else {
			if (pendingRestoreTime > 0) {
				audio.currentTime = pendingRestoreTime;
				pendingRestoreTime = 0;
			}

			if (pendingAutoplay) {
				void audio.play().catch(() => {
					pendingAutoplay = false;
					setPlayButtonState(false);
					scheduleAutoplayRetry();
				});
			}
		}

		persistPlayerState();
	};

	const playAdjacentTrack = (offset: number) => {
		if (!musicTracks.length) return;
		const nextIndex = (activeMusicTrackIndex + offset + musicTracks.length) % musicTracks.length;
		setActiveMusicTrack(nextIndex, { autoplay: true });
	};

	const getInitialTrackIndex = (tracks: MusicTrack[], storedState: StoredPlayerState | null) => {
		const storedIndexBySrc =
			storedState && typeof storedState.src === 'string'
				? tracks.findIndex((track) => track.src === storedState.src)
				: -1;

		if (storedIndexBySrc >= 0) return storedIndexBySrc;
		if (storedState && Number.isInteger(storedState.index)) {
			return Math.min(Math.max(storedState.index as number, 0), tracks.length - 1);
		}

		return 0;
	};

	const hydrateTracks = (
		tracks: MusicTrack[],
		{
			autoplay = false,
			expand = false,
		}: {
			autoplay?: boolean;
			expand?: boolean;
		} = {},
	) => {
		const storedState = readStoredState();
		musicTracks = tracks;
		setReadyState(true);

		const initialIndex = getInitialTrackIndex(tracks, storedState);
		const initialVolume =
			storedState && typeof storedState.volume === 'number'
				? storedState.volume
				: DEFAULT_VOLUME;

		applyVolume(initialVolume, { persist: false });
		setExpanded(Boolean(expand || storedState?.expanded), { persist: false });
		setActiveMusicTrack(initialIndex, {
			autoplay,
			restoreTime:
				storedState && typeof storedState.currentTime === 'number'
					? storedState.currentTime
					: 0,
		});
	};

	const finishPendingAction = () => {
		const action = pendingAction;
		pendingAction = null;
		if (!action || !musicTracks.length) return;

		if (action === 'expand') {
			setExpanded(true);
			return;
		}

		if (action === 'previous') {
			playAdjacentTrack(-1);
			return;
		}

		if (action === 'next') {
			playAdjacentTrack(1);
			return;
		}

		if (!audio.getAttribute('src')) {
			setActiveMusicTrack(activeMusicTrackIndex, { autoplay: true });
			return;
		}

		void audio.play().catch(() => {
			setPlayButtonState(false);
		});
	};

	const ensureTracksLoaded = async ({
		autoplay = false,
		expand = false,
		forceRefresh = false,
	}: {
		autoplay?: boolean;
		expand?: boolean;
		forceRefresh?: boolean;
	} = {}) => {
		if (!forceRefresh && musicTracks.length > 0) {
			if (autoplay && (!audio.getAttribute('src') || audio.paused)) {
				setActiveMusicTrack(activeMusicTrackIndex, { autoplay: true });
			}
			if (expand) {
				setExpanded(true);
			}
			return;
		}

		if (loadPromise) {
			await loadPromise;
			return;
		}

		root.dataset.loading = 'true';

		loadPromise = (async () => {
			try {
				const response = await fetch('/api/music');
				const data = await response.json().catch(() => null);
				if (!response.ok) {
					throw new Error(data && typeof data.message === 'string' ? data.message : '');
				}

				const tracks = Array.isArray(data && data.tracks)
					? data.tracks.filter(
							(track: unknown): track is MusicTrack =>
								Boolean(track) &&
								typeof track === 'object' &&
								typeof (track as MusicTrack).src === 'string' &&
								(track as MusicTrack).src.length > 0,
						)
					: [];

				if (!tracks.length) {
					musicTracks = [];
					root.dataset.loading = 'false';
					setReadyState(false);
					currentLabel.textContent = NO_MUSIC;
					currentLabel.title = NO_MUSIC;
					return;
				}

				persistTrackCache(tracks);
				hydrateTracks(tracks, {
					autoplay,
					expand,
				});
				finishPendingAction();
			} catch {
				root.dataset.loading = 'false';
				setReadyState(false);
				currentLabel.textContent = LOAD_FAILED;
				currentLabel.title = LOAD_FAILED;
			} finally {
				loadPromise = null;
			}
		})();

		await loadPromise;
	};

	setControlsDisabled(true);
	setPlayButtonState(false);
	setVolumeSliderState(DEFAULT_VOLUME);

	const cachedTracks = readTrackCache();
	const storedState = readStoredState();

	if (cachedTracks) {
		hydrateTracks(cachedTracks.tracks, {
			autoplay: Boolean(storedState?.paused === false && storedState?.src),
			expand: Boolean(storedState?.expanded),
		});
	} else if (storedState?.paused === false && storedState?.src) {
		pendingAction = 'play';
		void ensureTracksLoaded({
			autoplay: true,
			expand: Boolean(storedState.expanded),
		});
	}

	toggleButton.addEventListener('click', () => {
		if (musicTracks.length === 0) {
			pendingAction = 'expand';
			void ensureTracksLoaded({ expand: true });
			return;
		}

		setExpanded(root.dataset.expanded !== 'true');
	});

	volumeSlider.addEventListener('input', () => {
		const nextVolume = Number(volumeSlider.value) / 100;
		applyVolume(nextVolume);
	});

	previousButton.addEventListener('click', () => {
		if (musicTracks.length === 0) {
			pendingAction = 'previous';
			void ensureTracksLoaded({ autoplay: true, expand: true });
			return;
		}

		playAdjacentTrack(-1);
	});

	playButton.addEventListener('click', () => {
		if (musicTracks.length === 0) {
			pendingAction = 'play';
			void ensureTracksLoaded({ autoplay: true, expand: true });
			return;
		}

		if (!audio.getAttribute('src')) {
			setActiveMusicTrack(activeMusicTrackIndex, { autoplay: true });
			return;
		}

		if (audio.paused) {
			void audio.play().catch(() => {
				setPlayButtonState(false);
			});
			return;
		}

		audio.pause();
	});

	nextButton.addEventListener('click', () => {
		if (musicTracks.length === 0) {
			pendingAction = 'next';
			void ensureTracksLoaded({ autoplay: true, expand: true });
			return;
		}

		playAdjacentTrack(1);
	});

	document.addEventListener('pointerdown', (event) => {
		if (root.dataset.expanded !== 'true') return;
		if (!(event.target instanceof Node)) return;
		if (root.contains(event.target)) return;
		setExpanded(false);
	});

	audio.addEventListener('loadedmetadata', () => {
		if (pendingRestoreTime > 0) {
			audio.currentTime = Math.min(pendingRestoreTime, audio.duration || pendingRestoreTime);
			pendingRestoreTime = 0;
		}

		if (pendingAutoplay) {
			void audio.play().catch(() => {
				pendingAutoplay = false;
				setPlayButtonState(false);
				scheduleAutoplayRetry();
			});
		} else {
			setPlayButtonState(false);
		}
	});

	audio.addEventListener('play', () => {
		pendingAutoplay = false;
		setPlayButtonState(true);
		persistPlayerState();
	});

	audio.addEventListener('pause', () => {
		setPlayButtonState(false);
		persistPlayerState();
	});

	audio.addEventListener('ended', () => {
		playAdjacentTrack(1);
	});

	audio.addEventListener('volumechange', () => {
		setVolumeSliderState(audio.volume);
		persistPlayerState();
	});

	audio.addEventListener('timeupdate', () => {
		const now = Date.now();
		if (now - lastPersistAt < 2000) return;
		lastPersistAt = now;
		persistPlayerState();
	});

	window.addEventListener('pagehide', persistPlayerState);
}
