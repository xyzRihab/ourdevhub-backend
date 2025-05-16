import { Injectable, InternalServerErrorException } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenaiService {
  private client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const resp = await this.client.embeddings.create({
        input: text,
        model: 'text-embedding-3-small',
        encoding_format: 'float',
      });
      return resp.data[0].embedding;
    } catch (err) {
      console.error('Error generating embedding:', err);
      throw new InternalServerErrorException('OpenAI embedding failed');
    }
  }

  cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
}
