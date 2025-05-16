/* eslint-disable */
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SummarizeService {
  private readonly apiKey = 'AIzaSyAoWCUnGzd0YopqSKpb6yIhSjechjndmZA';
  private readonly model = 'models/gemini-2.0-flash';

  async geminySummarizeText(text: string) {
    const prompt = `
    Role: You are an AI assistant specialized in summarizing for software developers.
    Task: Read the article below and generate a 3 to 4 sentence summary.
    Requirements:
    - Context: Focus on technical content and avoid adding any information not
    present in the source.
    - Audience: Write for developers familiar with the domain.
    - Tone: Maintain a formal yet approachable tone that balances readability with
    technical accuracy.
    - Response Format: Return a JSON object with the fields:
    { "summary": "<your 3 to 4 sentence summary here>" }
    - Fallback: If the provided article content is unclear or insufficient to generate a
    summary, return:
    { "error": "Cannot generate summary due to unclear content." }
    Summarize this text:\n${text}`;
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/${this.model}:generateContent?key=${this.apiKey}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    const candidate = response.data.candidates?.[0];
    const summary = candidate?.content?.parts?.[0]?.text;
    const result = JSON.parse(
      summary
        .replace(/```json\n?/g, '')
        .replace(/```$/, '')
        .trim(),
    );

    return { data: result };
  }

  async gptSummarizeText(text: string, retryCount = 0) {
    const MAX_RETRIES = 2;

    if (!text || text.trim().length < 50) {
      return {
        data: { error: 'Cannot generate summary due to unclear content.' },
      };
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `
  You are an AI assistant specialized in summarizing for software developers.
  - Respond ONLY with a valid JSON object and nothing else.
  - Summarize in 3 to 4 sentences.
  - Focus on technical content only.
  - Audience: Developers.
  - Formal but readable tone.
  - Response Valid Format:
    { "summary": "<your 3 to 4 sentence summary here>" }
  - Fallback: If the provided article content is unclear or insufficient to generate a
    summary, return:
    { "error": "Cannot generate summary due to unclear content." }
            `,
          },
          {
            role: 'user',
            content: `Summarize this text:\n${text}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 300,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      },
    );

    const content = response.data.choices[0].message.content;

    try {
      const cleaned = content.replace(/```json\n?|```/g, '').trim();
      const result = JSON.parse(cleaned);

      if ('summary' in result || 'error' in result) {
        return { data: result };
      }

      return { data: { error: 'Unexpected response structure.' } };
    } catch (error) {
      if (retryCount < MAX_RETRIES) {
        console.warn(
          `Retrying GPT summary request (${retryCount + 1}) due to error:`,
          error.message,
        );
        await new Promise((res) => setTimeout(res, 500)); // Wait 500ms before retry
        return this.gptSummarizeText(text, retryCount + 1);
      }
      return {
        data: { error: 'Failed to generate valid summary after retries.' },
      };
    }
  }
}
