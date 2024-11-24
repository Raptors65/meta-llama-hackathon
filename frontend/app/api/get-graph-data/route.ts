import { createOpenAI } from "@ai-sdk/openai";
import { CoreSystemMessage, CoreUserMessage, generateText } from "ai";
import { GraphData } from "react-force-graph-3d";

export const dynamic = "force-dynamic";

type GetGraphDataRequest = {
  userPrompt: string;
  graphData: GraphData | Record<PropertyKey, never>;
}

const systemMessage = `The user wants to learn about a topic. Given the topic, respond with a graph, where the nodes represent subtopics, the links represent links between the subtopics, and groups are general categories of subtopics (0 should always be the main question). Use JSON format and do not output anything other than the JSON itself. For example:

{
  "nodes": [
    {
      "id": "main_question",
      "name": "What causes urban traffic congestion?",
      "group": 0,
      "description": "How can those causes be addressed effectively?"
    },
    {
      "id": "public_transport",
      "name": "Public Transport",
      "group": 1,
      "description": "Buses, trains, subways reduce private vehicle reliance."
    },
    {
      "id": "road_infrastructure",
      "name": "Road Infrastructure",
      "group": 2,
      "description": "Roads, bridges, and lanes must accommodate growing vehicle numbers."
    },
    {
      "id": "technology",
      "name": "Technology",
      "group": 3,
      "description": "Smart systems reduce bottlenecks in real-time."
    },
    {
      "id": "policies_and_governance",
      "name": "Policies & Governance",
      "group": 4,
      "description": "Subsidies, governance improve public transport effectiveness."
    },
    {
      "id": "human_behavior",
      "name": "Human Behavior",
      "group": 5,
      "description": "Convenience often leads to preference for private cars."
    },
    {
      "id": "modes",
      "name": "Modes",
      "group": 1,
      "description": "Buses, trains, subways reduce private vehicle reliance."
    },
    {
      "id": "accessibility",
      "name": "Accessibility",
      "group": 1,
      "description": "Convenience of routes and stops improves adoption."
    },
    {
      "id": "challenges",
      "name": "Challenges",
      "group": 1,
      "description": "Funding and maintenance issues limit effectiveness."
    },
    {
      "id": "capacity",
      "name": "Capacity",
      "group": 2,
      "description": "Roads, bridges, and lanes must accommodate growing vehicle numbers."
    },
    {
      "id": "design",
      "name": "Design",
      "group": 2,
      "description": "Poor layouts lead to bottlenecks and inefficiencies."
    },
    {
      "id": "upgradability",
      "name": "Upgradability",
      "group": 2,
      "description": "Limited space in urban areas complicates expansion."
    },
    {
      "id": "traffic_management",
      "name": "Traffic Management",
      "group": 3,
      "description": "Smart systems reduce bottlenecks in real-time."
    },
    {
      "id": "navigation_tools",
      "name": "Navigation Tools",
      "group": 3,
      "description": "Apps like Google Maps ease congestion via better route planning."
    },
    {
      "id": "automation",
      "name": "Automation",
      "group": 3,
      "description": "Autonomous vehicles offer long-term congestion solutions."
    },
    {
      "id": "congestion_pricing",
      "name": "Congestion Pricing",
      "group": 4,
      "description": "Charges during peak hours reduce unnecessary trips."
    },
    {
      "id": "incentives",
      "name": "Incentives",
      "group": 4,
      "description": "Encourage carpooling, biking, or other alternatives."
    },
    {
      "id": "regulations",
      "name": "Regulations",
      "group": 4,
      "description": "Improved rules reduce traffic chaos and accidents."
    },
    {
      "id": "preferences",
      "name": "Preferences",
      "group": 5,
      "description": "Convenience often leads to preference for private cars."
    },
    {
      "id": "remote_work",
      "name": "Remote Work",
      "group": 5,
      "description": "Reduces the number of commuters."
    },
    {
      "id": "shared_mobility",
      "name": "Shared Mobility",
      "group": 5,
      "description": "Carpooling and ride-sharing cut down vehicle numbers."
    }
  ],
  "links": [
    {
      "source": "main_question",
      "target": "public_transport"
    },
    {
      "source": "main_question",
      "target": "road_infrastructure"
    },
    {
      "source": "main_question",
      "target": "technology"
    },
    {
      "source": "main_question",
      "target": "policies_and_governance"
    },
    {
      "source": "main_question",
      "target": "human_behavior"
    },
    {
      "source": "public_transport",
      "target": "modes"
    },
    {
      "source": "public_transport",
      "target": "accessibility"
    },
    {
      "source": "public_transport",
      "target": "challenges"
    },
    {
      "source": "road_infrastructure",
      "target": "capacity"
    },
    {
      "source": "road_infrastructure",
      "target": "design"
    },
    {
      "source": "road_infrastructure",
      "target": "upgradability"
    },
    {
      "source": "technology",
      "target": "traffic_management"
    },
    {
      "source": "technology",
      "target": "navigation_tools"
    },
    {
      "source": "technology",
      "target": "automation"
    },
    {
      "source": "policies_and_governance",
      "target": "congestion_pricing"
    },
    {
      "source": "policies_and_governance",
      "target": "incentives"
    },
    {
      "source": "policies_and_governance",
      "target": "regulations"
    },
    {
      "source": "human_behavior",
      "target": "preferences"
    },
    {
      "source": "human_behavior",
      "target": "remote_work"
    },
    {
      "source": "human_behavior",
      "target": "shared_mobility"
    },
    {
      "source": "public_transport",
      "target": "road_infrastructure",
      "description": "Efficient public transport requires well-maintained roads and dedicated lanes."
    },
    {
      "source": "public_transport",
      "target": "policies_and_governance",
      "description": "Subsidies and governance improve public transport effectiveness."
    },
    {
      "source": "technology",
      "target": "road_infrastructure",
      "description": "Technology like smart traffic lights depends on good infrastructure."
    },
    {
      "source": "human_behavior",
      "target": "policies_and_governance",
      "description": "Policies influence commuting choices and encourage alternatives like carpooling."
    },
    {
      "source": "road_infrastructure",
      "target": "human_behavior",
      "description": "Poor infrastructure affects driver behavior and leads to inefficiencies."
    }
  ]
}`;

const followSystemMessage = `The user has a graph and the user wants to learn more about a topic or text. Given the topic or text, respond with a graph that expands the graph you last provided (keep everything from your previous graph), where the nodes represent subtopics, the links represent links between the subtopics, and groups are general categories of subtopics (0 should always be the main question). Use JSON format and do not output anything other than the JSON itself.`;

export async function POST(req: Request) {

  console.log("req received")
  const { userPrompt, graphData } = await req.json() as GetGraphDataRequest;
  console.log(graphData);

  let messages;
  if ("links" in graphData) {
    console.log("follow")
    messages = [
      {
        role: "system",
        content: followSystemMessage
      },
      {
        role: "assistant",
        content: JSON.stringify(graphData)
      },
      {
        role: "user",
        content: userPrompt
      }
    ] as (CoreUserMessage | CoreSystemMessage)[];
  } else {
    console.log("straight")
    messages = [
      {
        role: "system",
        content: systemMessage
      },
      {
        role: "user",
        content: userPrompt
      }
    ] as (CoreUserMessage | CoreSystemMessage)[];
  }

  const nebius = createOpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: process.env.NEBIUS_API_KEY
  })

  const result = await generateText({
    model: nebius("llama-3.2-90b-vision-preview"),
    messages,
  });

  // console.log(`'''${result.text}'''`);

  const data = JSON.parse(result.text);

  return Response.json(data);
}