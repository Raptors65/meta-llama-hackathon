import { createOpenAI } from "@ai-sdk/openai";
import { CoreSystemMessage, CoreUserMessage, generateText } from "ai";

export const dynamic = "force-dynamic";

type GetGraphDataRequest = {
  userPrompt: string;
}

const systemMessage = `The user wants to learn about a topic. Given the topic, respond with a graph, where the nodes represent subtopics and the links represent links between the subtopics. Use JSON format, e.g.,
{
    "nodes": [ 
        { 
          "id": "id1",
          "name": "name1",
          "val": 1 
        },
        { 
          "id": "id2",
          "name": "name2",
          "val": 10 
        }
    ],
    "links": [
        {
            "source": "id1",
            "target": "id2"
        }
    ]
}`

export async function POST(req: Request) {

  console.log("req received")
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

  const result = await generateText({
    model: nebius("meta-llama/Meta-Llama-3.1-405B-Instruct"),
    messages,
  });

  console.log(`'''${result.text}'''`);

  const data = JSON.parse(result.text);

  return Response.json(data);
}