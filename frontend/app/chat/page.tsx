"use client";

import { useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import clsx from "clsx";
import * as THREE from 'three';
import SpriteText from "three-spritetext";
import { useChat } from "ai/react";
import Loader from "@/components/loader";

import logo from "../logo.png";
import { Switch } from "@/components/ui/switch";

import { LogOut, User } from 'lucide-react';
import { useUser } from '@auth0/nextjs-auth0/client';


const ForceGraph3D = dynamic(() => import("react-force-graph-3d"));

export default function Chat() {
  const [graphData, setGraphData] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [is3D, setIs3D] = useState(false);

  const { user, isLoading: isLoadingUser } = useUser();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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

      {/* Profile Section */}
      <div className="w-full px-4 py-2 flex justify-end">
        {isLoadingUser ? (
          <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
        ) : user && (
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-full focus:outline-none focus:ring-2 focus:ring-[#671372] focus:ring-offset-2"
            >
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name || 'Profile'}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-[#671372] flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
            </button>

            {isProfileOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10"
                  onClick={() => setIsProfileOpen(false)} 
                />
                <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-lg shadow-lg border border-gray-100 z-20">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="overflow-ellipsis text-sm font-semibold text-gray-700">{user.name}</p>
                    <p className="overflow-ellipsis text-sm text-gray-500 truncate">{user.email}</p>
                  </div>
                  <a
                    href="/api/auth/logout"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out
                  </a>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <div className="mx-5 flex flex-col items-center mb-6">
        <Image alt="Logo" src={logo} width={227} height={101} />
        <div className="relative mt-5">
          <input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="What would you like to learn?" className="text-lg px-4 py-2 rounded-full w-[32rem] border-[#671372] border-2 mt-5" />
          <button disabled={isLoading} onClick={sendPrompt} className={clsx("absolute right-2 top-7 rounded-full text-white bg-[#671372]  py-1 px-2 transition-all duration-300 ease-in-out transform" , {"opacity-75": isLoading, "hover:shadow-lg hover:scale-105": !isLoading})}>Guide Me</button>
        </div>
      </div>
      <div className="w-96 mb-8">
        <div className="flex justify-between items-center">
          <div className="text-xl">Switch to 3D</div>
          <Switch
            checked={is3D}
            onCheckedChange={(e) => setIs3D(e.valueOf)}
          />
        </div>
        <div className="text-[#757575] text-sm">Get a comprehensive diagram to deepen your knowledge</div>
      </div>
      <p className="max-w-3xl">{summary}</p>
      <div className="flex justify-center mt-5">
        {isLoading &&
        <div className="flex items-center">
          <div className="mr-2 inline-block text-sm text-gray-700">Generating graph...</div>
          <Loader  />
        </div>}
      </div>
      {graphData && 
        <ForceGraph3D
          backgroundColor="white"
          nodeAutoColorBy={(node) => node.section}
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
          height={500}
          graphData={graphData}
        />
      }
      <p className="absolute top-2 text-gray-400">Responses are generated by AI and may not be fully accurate.</p>
    </main>
    
  );
}
