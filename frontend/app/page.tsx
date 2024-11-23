"use client";

import ForceGraph2D from "react-force-graph-2d";
import Image from "next/image";

export default function Home() {
  const graphData = {
    nodes: [
      { 
        "id": "id1",
        "name": "name1",
        "val": 1 
      },
      { 
        "id": "id2",
        "name": "name2",
        "val": 10 
      },
    ],
    links: [
      {
        "source": "id1",
        "target": "id2"
      },
    ]
  }

  return (
    <div>
      <ForceGraph2D
        graphData={graphData}
      />
    </div>
  );
}
