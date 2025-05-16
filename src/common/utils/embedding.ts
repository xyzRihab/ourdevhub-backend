export function computeMeanEmbedding(embeddings: number[][]): number[] {
  if (embeddings.length === 0) return [];

  const size = embeddings[0].length;
  const meanEmbedding = new Array(size).fill(0);
  const totalEmbeddings = embeddings.length;

  for (const emb of embeddings) {
    for (let i = 0; i < size; i++) {
      meanEmbedding[i] += emb[i] / totalEmbeddings;
    }
  }

  return meanEmbedding;
}
