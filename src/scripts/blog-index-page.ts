const BLOG_INDEX_STATE_KEY = '__joylifeBlogIndexState';

type BlogIndexState = {
	bound: boolean;
	cleanup: (() => void) | null;
	activeTags: string[];
};

type WindowWithBlogState = Window & {
	[BLOG_INDEX_STATE_KEY]?: BlogIndexState;
};

const blogWindow = window as WindowWithBlogState;
const blogState =
	blogWindow[BLOG_INDEX_STATE_KEY] ??
	(blogWindow[BLOG_INDEX_STATE_KEY] = {
		bound: false,
		cleanup: null,
		activeTags: [],
	});

const mountBlogIndex = () => {
	if (typeof blogState.cleanup === 'function') {
		blogState.cleanup();
		blogState.cleanup = null;
	}

	const root = document.querySelector('[data-blog-index]');
	if (!(root instanceof HTMLElement)) return;

	const tagClearButton = root.querySelector('[data-blog-tag-clear]');
	const tagOptions = Array.from(root.querySelectorAll('[data-blog-tag-option]'));
	const tagCheckboxes = Array.from(root.querySelectorAll('[data-blog-tag-checkbox]'));
	const selectedTags = root.querySelector('[data-blog-selected-tags]');
	const tagSummary = root.querySelector('[data-blog-tag-summary]');
	const cards = Array.from(root.querySelectorAll('[data-blog-card]'));
	const status = root.querySelector('[data-blog-filter-status]');
	const emptyState = root.querySelector('[data-blog-empty]');

	if (!(status instanceof HTMLElement) || !(emptyState instanceof HTMLElement)) return;

	const availableTags = new Set(
		tagCheckboxes
			.map((checkbox) => (checkbox instanceof HTMLInputElement ? checkbox.value : ''))
			.filter(Boolean),
	);
	let activeTags = new Set(
		Array.isArray(blogState.activeTags)
			? blogState.activeTags.filter((tag) => typeof tag === 'string' && availableTags.has(tag))
			: [],
	);

	const readCardTags = (card: Element) => {
		if (!(card instanceof HTMLElement)) return [];
		try {
			const parsed = JSON.parse(card.dataset.tags || '[]');
			return Array.isArray(parsed) ? parsed : [];
		} catch {
			return [];
		}
	};

	const setCardVisibility = (card: HTMLElement, visible: boolean) => {
		card.hidden = !visible;
		card.style.display = visible ? '' : 'none';
	};

	const syncState = () => {
		blogState.activeTags = Array.from(activeTags);
	};

	const renderSelectedTags = () => {
		if (!(selectedTags instanceof HTMLElement)) return;
		selectedTags.replaceChildren();

		const selectedList = Array.from(activeTags);
		selectedTags.hidden = selectedList.length === 0;

		for (const tag of selectedList) {
			const button = document.createElement('button');
			button.type = 'button';
			button.className = 'blog-selected-tag';
			button.dataset.removeTag = tag;
			button.setAttribute('aria-label', `移除标签 ${tag}`);
			button.textContent = tag;

			const close = document.createElement('span');
			close.className = 'blog-selected-tag__remove';
			close.setAttribute('aria-hidden', 'true');
			close.textContent = '×';
			button.append(close);

			selectedTags.append(button);
		}
	};

	const applyFilter = () => {
		tagCheckboxes.forEach((checkbox) => {
			if (!(checkbox instanceof HTMLInputElement)) return;
			checkbox.checked = activeTags.has(checkbox.value);
			const option = checkbox.closest('[data-blog-tag-option]');
			if (option instanceof HTMLElement) {
				option.classList.toggle('active', checkbox.checked);
			}
		});

		let visibleCount = 0;
		cards.forEach((card) => {
			if (!(card instanceof HTMLElement)) return;
			const cardTags = readCardTags(card);
			const matches =
				activeTags.size === 0 || Array.from(activeTags).every((tag) => cardTags.includes(tag));
			setCardVisibility(card, matches);
			if (matches) {
				visibleCount += 1;
			}
		});

		const selectedTagList = Array.from(activeTags);
		if (tagSummary instanceof HTMLElement) {
			tagSummary.textContent = selectedTagList.length === 0 ? '全部标签' : '已选 ' + selectedTagList.length + ' 个';
		}
		if (tagClearButton instanceof HTMLButtonElement) {
			tagClearButton.hidden = selectedTagList.length === 0;
		}

		renderSelectedTags();
		tagOptions.forEach((option) => {
			if (option instanceof HTMLElement) {
				option.hidden = false;
			}
		});

		status.textContent =
			selectedTagList.length === 0
				? '当前显示本页全部文章。'
				: '当前匹配到 ' + visibleCount + ' 篇文章，标签：' + selectedTagList.join(' / ') + '。';
		emptyState.textContent =
			selectedTagList.length === 0 ? '当前页还没有文章。' : '当前标签下，本页还没有文章。';
		emptyState.hidden = visibleCount > 0;
		syncState();
	};

	const handleTagChange = (event: Event) => {
		const checkbox = event.currentTarget;
		if (!(checkbox instanceof HTMLInputElement)) return;
		if (checkbox.checked) {
			activeTags.add(checkbox.value);
		} else {
			activeTags.delete(checkbox.value);
		}
		applyFilter();
	};

	const handleClearTags = () => {
		if (activeTags.size === 0) return;
		activeTags.clear();
		applyFilter();
	};

	const handleSelectedTagClick = (event: Event) => {
		const target = event.target;
		if (!(target instanceof HTMLElement)) return;
		const removeButton = target.closest('[data-remove-tag]');
		if (!(removeButton instanceof HTMLButtonElement)) return;
		const tag = removeButton.dataset.removeTag;
		if (!tag || !activeTags.has(tag)) return;
		activeTags.delete(tag);
		applyFilter();
	};

	if (tagClearButton instanceof HTMLButtonElement) {
		tagClearButton.addEventListener('click', handleClearTags);
	}
	if (selectedTags instanceof HTMLElement) {
		selectedTags.addEventListener('click', handleSelectedTagClick);
	}
	tagCheckboxes.forEach((checkbox) => {
		if (!(checkbox instanceof HTMLInputElement)) return;
		checkbox.addEventListener('change', handleTagChange);
	});

	applyFilter();

	blogState.cleanup = () => {
		if (tagClearButton instanceof HTMLButtonElement) {
			tagClearButton.removeEventListener('click', handleClearTags);
		}
		if (selectedTags instanceof HTMLElement) {
			selectedTags.removeEventListener('click', handleSelectedTagClick);
		}
		tagCheckboxes.forEach((checkbox) => {
			if (!(checkbox instanceof HTMLInputElement)) return;
			checkbox.removeEventListener('change', handleTagChange);
		});
	};
};

if (!blogState.bound) {
	blogState.bound = true;
	document.addEventListener('astro:page-load', mountBlogIndex);
	document.addEventListener('astro:before-swap', () => {
		if (typeof blogState.cleanup === 'function') {
			blogState.cleanup();
			blogState.cleanup = null;
		}
	});
}

mountBlogIndex();
