import { createOpenAI } from "@ai-sdk/openai";
import { CoreSystemMessage, CoreUserMessage, generateText } from "ai";

export const dynamic = "force-dynamic";

type GetGraphDataRequest = {
  userPrompt: string;
}

const systemMessage = `The user wants to learn about a topic. Given the topic, respond with a graph, where the nodes represent subtopics, the links represent links between the subtopics, and sections are general categories of subtopics. Use JSON format and do not output anything other than the JSON itself. For example:

{
    "nodes": [ 
        { 
          "id": "matrix_algebra",
          "name": "Matrix Algebra",
          "section": "Matrices and Vectors"
        },
        { 
          "id": "dot_product",
          "name": "Dot Product",
          "section": "Matrices and Vectors"
        },
    ],
    "links": [
        {
            "source": "matrix_algebra",
            "target": "dot_product"
        },
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
    model: nebius("meta-llama/Meta-Llama-3.1-70B-Instruct"),
    messages,
  });

  console.log(`'''${result.text}'''`);

  const data = JSON.parse(result.text);

  return Response.json(data);
}