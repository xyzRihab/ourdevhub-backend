function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Example usage
const embedding1 = [0.1, 0.3, 0.5];
const embedding2 = [0.1, 0.29, 0.51];

const sim = cosineSimilarity(embedding1, embedding2);
console.log('Cosine Similarity:', sim);
