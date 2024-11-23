"use client";

import { useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import clsx from "clsx";
import * as THREE from 'three';
import SpriteText from "three-spritetext";
import { useChat } from "ai/react";
import Loader from "@/components/loader";
import {
  ReactFlow,
} from '@xyflow/react';

import logo from "../logo.png";
import { Switch } from "@/components/ui/switch";
import { GraphData } from "react-force-graph-3d";

const ForceGraph3D = dynamic(() => import("react-force-graph-3d"));
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"));

export default function Chat() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [is3D, setIs3D] = useState(false);

  const getGraphData = async () => {
    setIsLoading(true);
    // const response = await fetch("/api/get-graph-data", {
    //   method: "POST",
    //   body: JSON.stringify({ userPrompt: prompt }),
    //   headers: {
    //     'Content-Type': 'application/json',
    //   }
    // });

    // setGraphData(await response.json());

    setGraphData({
      nodes: [
        { id: "main_question", name: "What causes urban traffic congestion, and how can those causes be addressed effectively?", group: 0 },
        { id: "public_transport", name: "Public Transport", group: 1 },
        { id: "road_infrastructure", name: "Road Infrastructure", group: 2 },
        { id: "technology", name: "Technology", group: 3 },
        { id: "policies_and_governance", name: "Policies & Governance", group: 4 },
        { id: "human_behavior", name: "Human Behavior", group: 5 },
        { id: "modes", name: "Modes: Buses, trains, subways reduce private vehicle reliance.", group: 1 },
        { id: "accessibility", name: "Accessibility: Convenience of routes and stops improves adoption.", group: 1 },
        { id: "challenges", name: "Challenges: Funding and maintenance issues limit effectiveness.", group: 1 },
        { id: "capacity", name: "Capacity: Roads, bridges, and lanes must accommodate growing vehicle numbers.", group: 2 },
        { id: "design", name: "Design: Poor layouts lead to bottlenecks and inefficiencies.", group: 2 },
        { id: "upgradability", name: "Upgradability: Limited space in urban areas complicates expansion.", group: 2 },
        { id: "traffic_management", name: "Traffic Management: Smart systems reduce bottlenecks in real time.", group: 3 },
        { id: "navigation_tools", name: "Navigation Tools: Apps like Google Maps ease congestion via better route planning.", group: 3 },
        { id: "automation", name: "Automation: Autonomous vehicles offer long-term congestion solutions.", group: 3 },
        { id: "congestion_pricing", name: "Congestion Pricing: Charges during peak hours reduce unnecessary trips.", group: 4 },
        { id: "incentives", name: "Incentives: Encourage carpooling, biking, or other alternatives.", group: 4 },
        { id: "regulations", name: "Regulations: Improved rules reduce traffic chaos and accidents.", group: 4 },
        { id: "preferences", name: "Preferences: Convenience often leads to preference for private cars.", group: 5 },
        { id: "remote_work", name: "Remote Work: Reduces the number of commuters.", group: 5 },
        { id: "shared_mobility", name: "Shared Mobility: Carpooling and ride-sharing cut down vehicle numbers.", group: 5 }
      ],
      links: [
        { source: "main_question", target: "public_transport" },
        { source: "main_question", target: "road_infrastructure" },
        { source: "main_question", target: "technology" },
        { source: "main_question", target: "policies_and_governance" },
        { source: "main_question", target: "human_behavior" },
        { source: "public_transport", target: "modes" },
        { source: "public_transport", target: "accessibility" },
        { source: "public_transport", target: "challenges" },
        { source: "road_infrastructure", target: "capacity" },
        { source: "road_infrastructure", target: "design" },
        { source: "road_infrastructure", target: "upgradability" },
        { source: "technology", target: "traffic_management" },
        { source: "technology", target: "navigation_tools" },
        { source: "technology", target: "automation" },
        { source: "policies_and_governance", target: "congestion_pricing" },
        { source: "policies_and_governance", target: "incentives" },
        { source: "policies_and_governance", target: "regulations" },
        { source: "human_behavior", target: "preferences" },
        { source: "human_behavior", target: "remote_work" },
        { source: "human_behavior", target: "shared_mobility" },
        { source: "public_transport", target: "road_infrastructure", description: "Efficient public transport requires well-maintained roads and dedicated lanes." },
        { source: "public_transport", target: "policies_and_governance", description: "Subsidies and governance improve public transport effectiveness." },
        { source: "technology", target: "road_infrastructure", description: "Technology like smart traffic lights depends on good infrastructure." },
        { source: "human_behavior", target: "policies_and_governance", description: "Policies influence commuting choices and encourage alternatives like carpooling." },
        { source: "road_infrastructure", target: "human_behavior", description: "Poor infrastructure affects driver behavior and leads to inefficiencies." }
      ]
    });
    setIsLoading(false);
  };

  const getSummary = async () => {
    const response = await fetch("/api/summary", {
      method: "POST",
      body: JSON.stringify({ userPrompt: prompt }),
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: isDone } = await reader.read();
      done = isDone;
      const chunk = decoder.decode(value, { stream: true });

      const subChunks = chunk.split("\n");

      for (const subChunk of subChunks) {
        if (subChunk.startsWith("0:")) {
          // Update state as each chunk arrives
          setSummary((prev) => prev + subChunk.trim().slice(3, -1).replaceAll("\\n", "\n"));
        }
      }
    }
  };

  const sendPrompt = () => {
    setSummary("");
    getGraphData();
    getSummary();
  };

  return (
    <main className="flex flex-col items-center w-full">
      <div className="mx-5 flex flex-col items-center mb-5">
        <Image alt="Logo" src={logo} width={227} height={101} />
        <div className="relative">
          <input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="What would you like to learn?" className="text-lg px-4 py-2 rounded-full w-[32rem] border-[#671372] border-2 mt-5" />
          <button disabled={isLoading} onClick={sendPrompt} className={clsx("absolute right-2 top-7 rounded-full text-white bg-[#671372] py-1 px-2", {"opacity-75": isLoading})}>Guide Me</button>
        </div>
      </div>
      <div className="w-96">
        <div className="flex justify-between items-center">
          <div className="text-xl">Switch to 3D</div>
          <Switch
            checked={is3D}
            onCheckedChange={(e) => setIs3D(e.valueOf())}
          />
        </div>
        <div className="text-[#757575] text-sm">Get a comprehensive diagram to deepen your knowledge</div>
      </div>
      <p className="max-w-3xl mt-5">{summary}</p>
      <div className="flex justify-center mt-5">
        {isLoading &&
        <div className="flex items-center">
          <div className="mr-2 inline-block text-sm text-gray-700">Generating graph...</div>
          <Loader  />
        </div>}
      </div>
      {graphData && (
        is3D ? 
          <ForceGraph3D
            backgroundColor="white"
            nodeAutoColorBy={(node) => node.group}
            nodeThreeObject={(node) => {
              const sprite = new SpriteText(node.name as string);
              sprite.color = node.color;
              sprite.backgroundColor = "#FFF"; // remove if too confusing
              sprite.textHeight = 5;
              return sprite;
            }}
            linkMaterial={() =>
              new THREE.LineBasicMaterial({
                color: 0xAAAAAA,
              })
            }
            nodeLabel={() => `<span style="color: #000; background-color: #FFF"></span>`}
            height={600}
            graphData={graphData}
          />
        :
        <ForceGraph2D
          backgroundColor="white"
          nodeAutoColorBy={(node) => node.group}
          nodeLabel={() => `<span style="color: #000; background-color: #FFF"></span>`}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.name as string;
            const fontSize = 12/globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            const textWidth = ctx.measureText(label).width;
            const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding

            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            // @ts-ignore
            ctx.fillRect(node.x! - bckgDimensions[0] / 2, node.y! - bckgDimensions[1] / 2, ...bckgDimensions);

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = node.color;
            ctx.fillText(label, node.x!, node.y!);

            node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
          }}
          height={400}
          graphData={graphData!}
        />
      )}
      <p>Responses are generated by AI and may be inaccurate or inappropriate.</p>
    </main>
  );
}
