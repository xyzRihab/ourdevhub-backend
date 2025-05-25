import { Body, Controller, Post } from '@nestjs/common';
import { OpenaiService } from './openai.service';

@Controller('openai')
export class OpenaiController {
  constructor(private readonly openaiService: OpenaiService) {}

  @Post('embed')
  async getEmbedding(@Body('text') text: string) {
    const embedding = await this.openaiService.generateEmbedding(text);
    return { data: embedding };
  }

  @Post('compare')
  async compareTexts(@Body() body: { text1: string; text2: string }) {
    const { text1, text2 } = body;
    const [embed1, embed2] = await Promise.all([
      this.openaiService.generateEmbedding(text1),
      this.openaiService.generateEmbedding(text2),
    ]);
    const similarity = this.openaiService.cosineSimilarity(embed1, embed2);

    return {
      data: similarity,
    };
  }
}
