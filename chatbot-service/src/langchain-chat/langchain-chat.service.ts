import { ChatOpenAI } from '@langchain/openai';
import { Injectable } from '@nestjs/common';
import { PromptTemplate } from '@langchain/core/prompts';
import { TEMPLATES } from '../utils/constants/templates.constants';
import { openAI } from '../utils/constants/openAI.constants';
import { HttpResponseOutputParser } from 'langchain/output_parsers';

@Injectable()
export class LangchainChatService {
  async chat(user_query: string) {
    const prompt = PromptTemplate.fromTemplate(TEMPLATES.BASIC_CHAT_TEMPLATE);

    const model = new ChatOpenAI({
      temperature: +openAI.BASIC_CHAT_OPENAI_TEMPERATURE,
      modelName: openAI.GPT_3_5_TURBO_1106.toString(),
      maxRetries: 0,
    });

    const outputParser = new HttpResponseOutputParser();
    const chain = prompt.pipe(model).pipe(outputParser);
    const response = await chain.invoke({
      input: user_query,
    });
    return Object.values(response)
      .map((code) => String.fromCharCode(code))
      .join('');
  }
}
