/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Pinecone, Index } from '@pinecone-database/pinecone';

@Injectable()
export class PineconeService implements OnModuleInit {
  private client: Pinecone;
  private index: Index;

  onModuleInit() {
    this.client = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    this.index = this.client.Index('ourdev-index');
  }

  async upsert(
    id: string,
    embedding: number[],
    metadata: Record<string, any>,
    namespace: string = 'default',
  ): Promise<void> {
    await this.index.namespace(namespace).upsert([
      {
        id,
        values: embedding,
        metadata,
      },
    ]);
  }

  async query(embedding: number[], topK = 10, namespace: string = 'default') {
    const result = await this.index.namespace(namespace).query({
      vector: embedding,
      topK,
      includeMetadata: true,
    });
    return result.matches;
  }

  async fetchVectorById(id: string, namespace = 'default') {
    return await this.index.namespace(namespace).fetch([id]);

  }

  async delete(id: string, namespace: string = 'default'): Promise<void> {
    await this.index.namespace(namespace).deleteOne(id);
  }
}
