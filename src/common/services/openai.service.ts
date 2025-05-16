/* eslint-disable */
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenaiService {
  private readonly logger = new Logger(OpenaiService.name);
  private client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  // character limit (tweak as needed)
  private readonly MAX_CHARS = 7500;

  async generateEmbedding(text: string): Promise<number[]> {
    // 1️⃣ Truncate if too long
    if (text.length > this.MAX_CHARS) {
      this.logger.warn(`Input too large (${text.length} chars). Truncating to ${this.MAX_CHARS}.`);
      text = text.slice(0, this.MAX_CHARS);
    }

    try {
      const resp = await this.client.embeddings.create({
        input: text,
        model: 'text-embedding-3-large',
        encoding_format: 'float',
      });
      return resp.data[0].embedding;
    } catch (err) {
      this.logger.error('OpenAI embedding error', {
        message: err.message,
        stack: err.stack,
        response: err.response?.data,
        status: err.response?.status,
      });
      throw new InternalServerErrorException('OpenAI embedding failed');
    }
  }
}
