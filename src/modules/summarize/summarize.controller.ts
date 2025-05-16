/* eslint-disable */
import { Controller, Post, Body } from '@nestjs/common';
import { SummarizeService } from './summarize.service';

@Controller('summarize')
export class SummarizeController {
  constructor(private readonly summarizeService: SummarizeService) {}

  @Post()
  async summarizeText(@Body() body: { text: string; model: string }) {
    const { model } = body;
    if (model === 'gemini') {
      return this.summarizeService.geminySummarizeText(body.text);
    } else if (model === 'gpt') {
      return this.summarizeService.gptSummarizeText(body.text);
    } else {
      throw new Error('Invalid model specified. Use "gemini" or "gpt".');
    }
  }
}
