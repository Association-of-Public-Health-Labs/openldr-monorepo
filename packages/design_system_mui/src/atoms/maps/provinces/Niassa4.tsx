// components/NiassaMap.tsx
import { Stage, Layer, Path } from "react-konva";
import { useState } from "react";
import { niassaRegions } from "./niassaRegions.optimized"; // Your extracted paths


export type Props = {}

export function Niassa() {
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  return (
    <Stage width={1000} height={800}>
      <Layer>
        {niassaRegions.map((region) => (
          <Path
            key={region.id}
            data={region.path}
            fill={
              selectedRegion === region.id
                ? "#5ACC03"
                : hoveredRegion === region.id
                ? "#A8E87A"
                : "#eee"
            }
            stroke="#333"
            strokeWidth={1}
            onMouseEnter={() => setHoveredRegion(region.id)}
            onMouseLeave={() => setHoveredRegion(null)}
            onClick={() => setSelectedRegion(region.id)}
          />
        ))}
      </Layer>
    </Stage>
  );
}
