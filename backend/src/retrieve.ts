import { documentStore } from "./store";

export function retrieve(question: string) {
  const words = question.toLowerCase().split(" ");

  const results = documentStore.map((chunk) => {
    let score = 0;

    words.forEach((word) => {
      if (chunk.text.toLowerCase().includes(word)) {
        score++;
      }
    });

    return {
      ...chunk,
      score,
    };
  });

  // Filter out chunks with zero matches, sort by highest score, return top 3
  return results
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}
