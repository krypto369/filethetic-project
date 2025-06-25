"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface JsonViewerProps {
  data: any;
  rootName?: string;
  expandLevel?: number;
  className?: string;
}

export function JsonViewer({
  data,
  rootName = "root",
  expandLevel = 1,
  className,
}: JsonViewerProps) {
  return (
    <div className={cn("font-mono text-sm", className)}>
      <JsonNode
        name={rootName}
        data={data}
        level={0}
        defaultExpand={expandLevel}
      />
    </div>
  );
}

interface JsonNodeProps {
  name: string;
  data: any;
  level: number;
  defaultExpand: number;
}

function JsonNode({ name, data, level, defaultExpand }: JsonNodeProps) {
  const [expanded, setExpanded] = useState(level < defaultExpand);
  
  const isArray = Array.isArray(data);
  const isObject = data !== null && typeof data === "object" && !isArray;
  const hasChildren = isArray || isObject;
  
  // For arrays or objects
  if (hasChildren) {
    const childrenCount = isArray ? data.length : Object.keys(data).length;
    
    return (
      <div className="ml-2">
        <div 
          className="flex items-center gap-1 cursor-pointer hover:bg-muted/50 py-0.5 px-1 rounded"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 
            <ChevronDown className="h-3 w-3 text-muted-foreground flex-shrink-0" /> : 
            <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          }
          <span className="text-blue-600">{name}</span>
          <span className="text-gray-500 text-xs ml-1">
            {isArray ? `[${childrenCount}]` : `{${childrenCount}}`}
          </span>
        </div>
        
        {expanded && (
          <div className="ml-4 border-l border-dashed border-gray-300 pl-2">
            {isArray ? (
              // Array children
              data.map((item: any, index: number) => (
                <JsonNode
                  key={index}
                  name={String(index)}
                  data={item}
                  level={level + 1}
                  defaultExpand={defaultExpand}
                />
              ))
            ) : (
              // Object children
              Object.entries(data).map(([key, value]) => (
                <JsonNode
                  key={key}
                  name={key}
                  data={value}
                  level={level + 1}
                  defaultExpand={defaultExpand}
                />
              ))
            )}
          </div>
        )}
      </div>
    );
  }
  
  // For primitive values
  return (
    <div className="ml-2 flex items-start gap-1 py-0.5 hover:bg-muted/30 px-1 rounded">
      <span className="text-blue-600">{name}:</span>
      <ValueDisplay value={data} />
    </div>
  );
}

function ValueDisplay({ value }: { value: any }) {
  if (value === null) {
    return <span className="text-gray-500">null</span>;
  }
  
  if (value === undefined) {
    return <span className="text-gray-500">undefined</span>;
  }
  
  switch (typeof value) {
    case "string":
      return <span className="text-green-600">"{value}"</span>;
    case "number":
      return <span className="text-amber-600">{value}</span>;
    case "boolean":
      return <span className="text-purple-600">{value.toString()}</span>;
    default:
      return <span>{String(value)}</span>;
  }
}
