import interviewNotesData from '../data/interview-notes.json';

export interface InterviewNote {
	id: string;
	question: string;
	summary?: string;
	answer: string[];
	category: string;
	updatedAt?: string;
}

export const getInterviewNotes = () => interviewNotesData as InterviewNote[];

export const buildInterviewSearchText = (note: InterviewNote) =>
	[note.category, note.question, note.summary ?? '', ...note.answer]
		.join(' ')
		.toLowerCase()
		.replace(/\s+/g, ' ')
		.trim();
