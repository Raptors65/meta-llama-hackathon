"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import clsx from "clsx";
import * as THREE from 'three';
import SpriteText from "three-spritetext";

const ForceGraph3D = dynamic(() => import("react-force-graph-3d"));

export default function Chat() {
  const [graphData, setGraphData] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getGraphData = async () => {
    setIsLoading(true);
    const response = await fetch("/api/get-graph-data", {
      method: "POST",
      body: JSON.stringify({ userPrompt: prompt }),
      headers: {
        'Content-Type': 'application/json',
      }
    });

    setGraphData(await response.json());
    setIsLoading(false);
  };

  return (
    <main className="flex flex-col items-center w-full">
      <div className="mx-5 flex flex-col items-center mb-5">
        <img src="/logo.png" width={227} height={101} />
        <div className="relative">
          <input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="What would you like to learn?" className="text-lg px-4 py-2 rounded-full w-[32rem] border-[#671372] border-2 mt-5" />
          <button disabled={isLoading} onClick={getGraphData} className={clsx("absolute right-2 top-7 rounded-full text-white bg-[#671372] py-1 px-2", {"opacity-75": isLoading})}>Guide Me</button>
        </div>
      </div>
      {graphData && 
        <ForceGraph3D
          backgroundColor="white"
          nodeThreeObject={(node) => {
            const sprite = new SpriteText(node.name as string);
            sprite.color = "#000";
            sprite.backgroundColor = "#FFF"; // remove if too confusing
            sprite.textHeight = 5;
            return sprite;
          }}
          linkMaterial={() =>
            new THREE.LineBasicMaterial({
              color: 0xAAAAAA,
            })
          }
          nodeColor="black"
          nodeLabel={() => `<span style="color: #000; background-color: #FFF"></span>`}
          height={600}
          graphData={graphData}
        />
      }
    </main>
  );
}
