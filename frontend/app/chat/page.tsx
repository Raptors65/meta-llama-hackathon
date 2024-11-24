"use client";

import { FormEventHandler, useState } from "react";
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
import { readPdfText } from 'pdf-text-reader';

import logo from "../logo.png";
import { Switch } from "@/components/ui/switch";
import { GraphData } from "react-force-graph-3d";

import { LogOut, User } from 'lucide-react';
import { useUser } from '@auth0/nextjs-auth0/client';
import pdfToText from 'react-pdftotext'
import { createClient } from '@supabase/supabase-js';

const ForceGraph3D = dynamic(() => import("react-force-graph-3d"));
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"));

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function Chat() {
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [is3D, setIs3D] = useState(false);

  const { user, isLoading: isLoadingUser } = useUser();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const getGraphData = async (p = prompt) => {
    setIsLoading(true);
    const response = await fetch("/api/get-graph-data", {
      method: "POST",
      body: JSON.stringify({ userPrompt: p }),
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    const generatedSummary = await getSummary(p);
    console.log("Generated Summary:", generatedSummary);
    const { error } = await supabase.from('graph_data').insert([
      {
        user_id: user?.sub,
        prompt: p,
        generated_summary: generatedSummary,
        graph_data: data,
        created_at: new Date().toISOString(),
      }
    ]);

    setGraphData(data);
    // setGraphData({'nodes': [{'id': 'stoicism_main', 'name': 'What are the fundamental principles, practices, and benefits of Stoicism', 'group': 0}, {'id': 'core_principles', 'name': 'Core Principles of Stoicism', 'group': 1}, {'id': 'virtue_ethics', 'name': 'Virtue Ethics', 'group': 2, 'description': 'Cultivating virtues like wisdom, justice, and self-control'}, {'id': 'reason_and_logic', 'name': 'Reason and Logic', 'group': 2, 'description': 'Emphasis on rational thinking and critical inquiry'}, {'id': 'indifference_to_external_events', 'name': 'Indifference to External Events', 'group': 2, 'description': 'Recognizing what can and cannot be controlled'}, {'id': 'living_in_accordance_with_nature', 'name': 'Living in Accordance with Nature', 'group': 2, 'description': 'Harmony with the natural order'}, {'id': 'stoic_practices_and_disciplines', 'name': 'Stoic Practices and Disciplines', 'group': 3}, {'id': 'meditation_and_reflection', 'name': 'Meditation and Reflection', 'group': 4, 'description': 'Regular introspection and self-examination'}, {'id': 'journaling_and_writing', 'name': 'Journaling and Writing', 'group': 4, 'description': 'Recording thoughts, insights, and experiences'}, {'id': 'physical_training_and_endurance', 'name': 'Physical Training and Endurance', 'group': 4, 'description': 'Building physical strength and resilience'}, {'id': 'negative_visualization', 'name': 'Negative Visualization', 'group': 4, 'description': 'Imagining and preparing for adversity'}, {'id': 'stoic_concepts_and_ideas', 'name': 'Stoic Concepts and Ideas', 'group': 5}, {'id': 'the_dichotomy_of_control', 'name': 'The Dichotomy of Control', 'group': 6, 'description': 'Recognizing what can and cannot be controlled'}, {'id': 'the_three_topoi', 'name': 'The Three Topoi', 'group': 6, 'description': 'Physical, moral, and external aspects of life'}, {'id': 'the_four_cardinal_virtues', 'name': 'The Four Cardinal Virtues', 'group': 6, 'description': 'Wisdom, justice, courage, and temperance'}, {'id': 'the_theory_of_impressions', 'name': 'The Theory of Impressions', 'group': 6, 'description': 'Understanding and managing thoughts and emotions'}, {'id': 'applying_stoicism_to_everyday_life', 'name': 'Applying Stoicism to Everyday Life', 'group': 7}, {'id': 'overcoming_anxiety_and_fear', 'name': 'Overcoming Anxiety and Fear', 'group': 8, 'description': 'Stoic strategies for managing emotions'}, {'id': 'building_resilience', 'name': 'Building Resilience', 'group': 8, 'description': 'Stoic practices for coping with adversity'}, {'id': 'improving_relationships', 'name': 'Improving Relationships', 'group': 8, 'description': 'Stoic principles for effective communication and empathy'}, {'id': 'achieving_personal_growth', 'name': 'Achieving Personal Growth', 'group': 8, 'description': 'Stoic concepts for self-improvement and self-awareness'}, {'id': 'challenges_and_criticisms_of_stoicism', 'name': 'Challenges and Criticisms of Stoicism', 'group': 9}, {'id': 'criticisms_of_stoic_emotional_suppression', 'name': 'Criticisms of Stoic Emotional Suppression', 'group': 10, 'description': 'Concerns about the health implications of suppressing emotions'}, {'id': 'difficulty_in_applying_stoic_principles', 'name': 'Difficulty in Applying Stoic Principles', 'group': 10, 'description': 'Challenges in integrating Stoic concepts into daily life'}, {'id': 'cultural_and_historical_context', 'name': 'Cultural and Historical Context', 'group': 10, 'description': 'Understanding Stoicism within its historical and cultural context'}, {'id': 'modern_adaptations_and_interpretations', 'name': 'Modern Adaptations and Interpretations', 'group': 10, 'description': 'Contemporary applications and reinterpretations of Stoicism'}], 'links': [{'source': 'stoicism_main', 'target': 'core_principles'}, {'source': 'stoicism_main', 'target': 'stoic_practices_and_disciplines'}, {'source': 'stoicism_main', 'target': 'stoic_concepts_and_ideas'}, {'source': 'stoicism_main', 'target': 'applying_stoicism_to_everyday_life'}, {'source': 'stoicism_main', 'target': 'challenges_and_criticisms_of_stoicism'}, {'source': 'core_principles', 'target': 'virtue_ethics'}, {'source': 'core_principles', 'target': 'reason_and_logic'}, {'source': 'core_principles', 'target': 'indifference_to_external_events'}, {'source': 'core_principles', 'target': 'living_in_accordance_with_nature'}, {'source': 'stoic_practices_and_disciplines', 'target': 'meditation_and_reflection'}, {'source': 'stoic_practices_and_disciplines', 'target': 'journaling_and_writing'}, {'source': 'stoic_practices_and_disciplines', 'target': 'physical_training_and_endurance'}, {'source': 'stoic_practices_and_disciplines', 'target': 'negative_visualization'}, {'source': 'stoic_concepts_and_ideas', 'target': 'the_dichotomy_of_control'}, {'source': 'stoic_concepts_and_ideas', 'target': 'the_three_topoi'}, {'source': 'stoic_concepts_and_ideas', 'target': 'the_four_cardinal_virtues'}, {'source': 'stoic_concepts_and_ideas', 'target': 'the_theory_of_impressions'}, {'source': 'applying_stoicism_to_everyday_life', 'target': 'overcoming_anxiety_and_fear'}, {'source': 'applying_stoicism_to_everyday_life', 'target': 'building_resilience'}, {'source': 'applying_stoicism_to_everyday_life', 'target': 'improving_relationships'}, {'source': 'applying_stoicism_to_everyday_life', 'target': 'achieving_personal_growth'}, {'source': 'challenges_and_criticisms_of_stoicism', 'target': 'criticisms_of_stoic_emotional_suppression'}, {'source': 'challenges_and_criticisms_of_stoicism', 'target': 'difficulty_in_applying_stoic_principles'}, {'source': 'challenges_and_criticisms_of_stoicism', 'target': 'cultural_and_historical_context'}, {'source': 'challenges_and_criticisms_of_stoicism', 'target': 'modern_adaptations_and_interpretations'}]})
    // setGraphData({
    //   nodes: [
    //     { id: "main_question", name: "What causes urban traffic congestion?", group: 0, description: "How can those causes be addressed effectively?" },
    //     { id: "public_transport", name: "Public Transport", group: 1, description: "Buses, trains, subways reduce private vehicle reliance." },
    //     { id: "road_infrastructure", name: "Road Infrastructure", group: 2, description: "Roads, bridges, and lanes must accommodate growing vehicle numbers." },
    //     { id: "technology", name: "Technology", group: 3, description: "Smart systems reduce bottlenecks in real-time." },
    //     { id: "policies_and_governance", name: "Policies & Governance", group: 4, description: "Subsidies, governance improve public transport effectiveness." },
    //     { id: "human_behavior", name: "Human Behavior", group: 5, description: "Convenience often leads to preference for private cars." },
    
    //     { id: "modes", name: "Modes", group: 1, description: "Buses, trains, subways reduce private vehicle reliance." },
    //     { id: "accessibility", name: "Accessibility", group: 1, description: "Convenience of routes and stops improves adoption." },
    //     { id: "challenges", name: "Challenges", group: 1, description: "Funding and maintenance issues limit effectiveness." },
    
    //     { id: "capacity", name: "Capacity", group: 2, description: "Roads, bridges, and lanes must accommodate growing vehicle numbers." },
    //     { id: "design", name: "Design", group: 2, description: "Poor layouts lead to bottlenecks and inefficiencies." },
    //     { id: "upgradability", name: "Upgradability", group: 2, description: "Limited space in urban areas complicates expansion." },
    
    //     { id: "traffic_management", name: "Traffic Management", group: 3, description: "Smart systems reduce bottlenecks in real-time." },
    //     { id: "navigation_tools", name: "Navigation Tools", group: 3, description: "Apps like Google Maps ease congestion via better route planning." },
    //     { id: "automation", name: "Automation", group: 3, description: "Autonomous vehicles offer long-term congestion solutions." },
    
    //     { id: "congestion_pricing", name: "Congestion Pricing", group: 4, description: "Charges during peak hours reduce unnecessary trips." },
    //     { id: "incentives", name: "Incentives", group: 4, description: "Encourage carpooling, biking, or other alternatives." },
    //     { id: "regulations", name: "Regulations", group: 4, description: "Improved rules reduce traffic chaos and accidents." },
    
    //     { id: "preferences", name: "Preferences", group: 5, description: "Convenience often leads to preference for private cars." },
    //     { id: "remote_work", name: "Remote Work", group: 5, description: "Reduces the number of commuters." },
    //     { id: "shared_mobility", name: "Shared Mobility", group: 5, description: "Carpooling and ride-sharing cut down vehicle numbers." }
    //   ],
    //   links: [
    //     { source: "main_question", target: "public_transport" },
    //     { source: "main_question", target: "road_infrastructure" },
    //     { source: "main_question", target: "technology" },
    //     { source: "main_question", target: "policies_and_governance" },
    //     { source: "main_question", target: "human_behavior" },
        
    //     { source: "public_transport", target: "modes" },
    //     { source: "public_transport", target: "accessibility" },
    //     { source: "public_transport", target: "challenges" },
    
    //     { source: "road_infrastructure", target: "capacity" },
    //     { source: "road_infrastructure", target: "design" },
    //     { source: "road_infrastructure", target: "upgradability" },
    
    //     { source: "technology", target: "traffic_management" },
    //     { source: "technology", target: "navigation_tools" },
    //     { source: "technology", target: "automation" },
    
    //     { source: "policies_and_governance", target: "congestion_pricing" },
    //     { source: "policies_and_governance", target: "incentives" },
    //     { source: "policies_and_governance", target: "regulations" },
    
    //     { source: "human_behavior", target: "preferences" },
    //     { source: "human_behavior", target: "remote_work" },
    //     { source: "human_behavior", target: "shared_mobility" },
    
    //     { source: "public_transport", target: "road_infrastructure", description: "Efficient public transport requires well-maintained roads and dedicated lanes." },
    //     { source: "public_transport", target: "policies_and_governance", description: "Subsidies and governance improve public transport effectiveness." },
    //     { source: "technology", target: "road_infrastructure", description: "Technology like smart traffic lights depends on good infrastructure." },
    //     { source: "human_behavior", target: "policies_and_governance", description: "Policies influence commuting choices and encourage alternatives like carpooling." },
    //     { source: "road_infrastructure", target: "human_behavior", description: "Poor infrastructure affects driver behavior and leads to inefficiencies." }
    //   ]
    // });

    
    setIsLoading(false);
  };

  const getSummary = async (p = prompt) => {
    let completeSummary = "";
    const response = await fetch("/api/summary", {
      method: "POST",
      body: JSON.stringify({ userPrompt: p }),
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
          const text = subChunk.trim().slice(3, -1).replaceAll("\\n", "\n");
          completeSummary += text; // Append chunk to the temporary variable
          // Update state as each chunk arrives
          setSummary((prev) => prev + subChunk.trim().slice(3, -1).replaceAll("\\n", "\n"));
        }
      }
    }
    return completeSummary; // Return the full summary
  };

  const sendPrompt = () => {
    setSummary("");
    getGraphData();
    getSummary();
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select a PDF file');
      return;
    }
    
    setError('');
    
    const text = await pdfToText(file);

    getGraphData(text);
    getSummary(text);
  };

  return (
    <main className="flex flex-col items-center w-full">

      {/* Profile Section */}
      <div className="w-full px-4 py-2 flex justify-end">
        {isLoadingUser ? (
          <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
        ) : user ? (
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
        ) : (
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center justify-center w-10 h-10 rounded-full focus:outline-none focus:ring-2 focus:ring-[#671372] focus:ring-offset-2"
            >
              <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-300">
                <User className="w-5 h-5 text-gray-600" />
              </div>
            </button>
            {isProfileOpen && (
              <>
                <div 
                  className="fixed inset-0 z-10"
                  onClick={() => setIsProfileOpen(false)} 
                />
                <div className="absolute right-0 mt-2 w-48 py-2 bg-white rounded-lg shadow-lg border border-gray-100 z-20">

                  <a
                    href="/api/auth/logout"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Home Page
                  </a>
                </div>
              </>
            )}
          </div>
          
        )}
      </div>

      <div className="mx-5 flex flex-col items-center">
        <Image alt="Logo" src={logo} width={227} height={101} />
        <div className="relative mt-5">
          <textarea value={prompt} 
                    onChange={(e) => setPrompt(e.target.value)} 
                    placeholder="What would you like to learn?"
                    rows={2}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = "auto"; // Reset height
                      const minHeight = target.scrollHeight; // Set minimum height
                      target.style.height = `${(target.scrollHeight)}px`;; // Set to scroll height
                    }}
                    className="text-lg px-4 py-2 rounded-3xl w-[32rem] border-[#671372] border-2 mt-5 resize-none overflow-hidden"
                    style={{
                      paddingBottom: `${prompt.split("\n").length >= 1 ? "2.3rem" : "0.5rem"}`, // Add extra padding for the last line if multiple lines exist
                    }}/>
          <button disabled={isLoading} onClick={sendPrompt} className={clsx("absolute bottom-3 right-2 rounded-full text-white bg-[#671372]  py-1 px-2 transition-all duration-300 ease-in-out transform" , {"opacity-75": isLoading, "hover:shadow-lg hover:scale-105": !isLoading})}>Guide Me</button>
        </div>
      </div>

      <p className="font-bold">OR</p>

      <form onSubmit={handleSubmit} className="mt-2">
        <label htmlFor="upload-pdf" className={clsx("inline-block rounded-full py-1 px-2 text-black transition-all duration-300 ease-in-out transform relative hover:shadow-lg hover:scale-105 cursor-pointer", {"bg-[#671372] text-white": file === null, "bg-white": file !== null})}>{file ? "File selected" : "Select a PDF..."}</label>
        <input type="file" accept=".pdf" id="upload-pdf" className="opacity-0 absolute -z-10" onChange={(e) => {
          setFile(e.target.files && e.target.files[0]);
        }} />
        {file && <input type="submit" className={clsx("cursor-pointer ml-5 rounded-full text-white bg-[#671372]  py-1 px-2 transition-all duration-300 ease-in-out transform" , {"opacity-75": isLoading, "hover:shadow-lg hover:scale-105": !isLoading})} value="Upload file" />}
      </form>

      <div className="w-96 mt-6">
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
              const sprite = new SpriteText(node.name as string + "\n\n\n");
              sprite.color = node.group === 0 ? "#000000" : node.color;
              // sprite.backgroundColor = "#FFF"; // remove if too confusing
              sprite.textHeight = node.group === 0 ? 10 : 5;

              const geometry = new THREE.SphereGeometry(node.group === 0 ? 10 : 5);
              const material = new THREE.MeshBasicMaterial({ color: node.group === 0 ? "#000000" : node.color, transparent: true, opacity: 1 });
              const sphere = new THREE.Mesh(geometry, material);

              // sprite.position.add(new THREE.Vector3(0, 0, -20));
              
              const group = new THREE.Group();
              group.add(sprite);
              group.add(sphere);
              return group;
            }}
            linkMaterial={() =>
              new THREE.LineBasicMaterial({
                color: 0xAAAAAA,
              })
            }
            nodeLabel={(node) => `<span style="color: #000; background-color: #EEE; border: 1px solid black; padding: 2px 5px; border-radius: 10px;">${node.description}</span>`}
            height={400}
            graphData={graphData}
          />
        :
        <ForceGraph2D
          backgroundColor="white"
          nodeAutoColorBy={(node) => node.group}
          nodeLabel={(node) => node.description}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.name as string;
            const fontSize = (node.group === 0 ? 16 : 12)/globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            const textWidth = ctx.measureText(label).width;
            const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding

            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            // @ts-ignore
            ctx.fillRect(node.x! - bckgDimensions[0] / 2, node.y! - bckgDimensions[1] / 2, ...bckgDimensions);

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = node.group === 0 ? "#000000" : node.color;
            ctx.fillText(label, node.x!, node.y!);

            node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
          }}
          height={400}
          graphData={graphData!}
        />
        )
      }
      <p className="absolute top-2 text-gray-400">Responses are generated by AI and may not be fully accurate.</p>
    
    </main>
    
  );
}
