import thoughtsData from '../data/thoughts.json';

export interface Thought {
	date: string;
	content: string;
}

const thoughts = thoughtsData as Thought[];

const getDateValue = (date: string) => new Date(`${date}T00:00:00`).valueOf();

export const getSortedThoughts = () =>
	[...thoughts].sort((a, b) => getDateValue(b.date) - getDateValue(a.date));

export const getRecentThoughts = (limit = 3) => getSortedThoughts().slice(0, limit);

export const getThoughtAnchor = (thought: Thought, index: number) =>
	`thought-${thought.date}-${index + 1}`;

export const formatThoughtDate = (date: string, style: 'short' | 'long' = 'short') =>
	new Intl.DateTimeFormat('zh-CN', {
		year: style === 'long' ? 'numeric' : undefined,
		month: 'long',
		day: 'numeric',
	}).format(new Date(`${date}T00:00:00`));
