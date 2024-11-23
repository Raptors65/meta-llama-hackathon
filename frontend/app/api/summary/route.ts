import { createOpenAI } from "@ai-sdk/openai";
import { CoreSystemMessage, CoreUserMessage, streamText } from "ai";

export const dynamic = "force-dynamic";

type GetGraphDataRequest = {
  userPrompt: string;
}

const systemMessage = `Give a short 1-2 sentence summary on the topic that the user specifies.`

export async function POST(req: Request) {
  const { userPrompt } = await req.json() as GetGraphDataRequest;

  const messages = [
    {
      role: "system",
      content: systemMessage
    },
    {
      role: "user",
      content: userPrompt
    }
  ] as (CoreUserMessage | CoreSystemMessage)[];

  const nebius = createOpenAI({
    baseURL: "https://api.studio.nebius.ai/v1/",
    apiKey: process.env.NEBIUS_API_KEY
  })

  const result = streamText({
    model: nebius("meta-llama/Meta-Llama-3.1-70B-Instruct"),
    messages,
  });

  return result.toDataStreamResponse();
}