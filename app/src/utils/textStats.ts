/**
 * Text statistics utilities.
 */

export function countWords(text: string): number {
	if (text == "") return 0;
	return text.trim().split(/\s+/).length;
}

export function averageWordLength(text: string): number {
	const words = text
		.trim()
		.split(/\s+/)
		.filter((w) => w.length > 0);
	if (words.length === 0) return 0;
	var totalLength = 0;
	for (const word of words) {
		totalLength += word.length;
	}
	return Math.round((totalLength / words.length) * 100) / 100;
}

export function summarize(text: string): Record<string, any> {
	const words = countWords(text);
	const chars = text.length;
	const avgLen = averageWordLength(text);
	return { words, chars, avgLen };
}
