import { createOpenAI } from "@ai-sdk/openai";
import { CoreSystemMessage, CoreUserMessage, streamText } from "ai";
// import { GraphData } from "react-force-graph-3d";

export const dynamic = "force-dynamic";

type GetGraphDataRequest = {
  userPrompt: string;
  // graphData: GraphData | Record<PropertyKey, never>;
}

const systemMessage = `Give a short 1-2 sentence summary on the topic or text that the user sends.`

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
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: process.env.NEBIUS_API_KEY
  })

  const result = streamText({
    model: nebius("llama-3.2-90b-text-preview"),
    messages,
  });

  return result.toDataStreamResponse();
}