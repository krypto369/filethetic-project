"use client";

// Activity feed component for displaying recent activity
interface ActivityItem {
  id: string;
  action: string;
  user: string;
  dataset: string;
  timestamp: string;
}

interface ActivityFeedProps {
  items: ActivityItem[];
  isLoading: boolean;
}

export function ActivityFeed({ items, isLoading }: ActivityFeedProps) {
  const renderActivitySkeleton = () => {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="flex items-center p-2 rounded hover:bg-secondary/40 animate-pulse">
            <div className="h-6 w-6 bg-muted rounded-full"></div>
            <div className="ml-3 space-y-2 flex-1">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderActivityItems = () => {
    return (
      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="flex items-center p-2 rounded hover:bg-secondary/40">
            <div className="text-primary">•</div>
            <div className="ml-3">
              <div className="text-sm">
                <span className="font-medium">{item.action}</span> {item.dataset}
              </div>
              <div className="text-xs text-muted-foreground">
                {item.user} • {item.timestamp}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-[300px] overflow-auto pr-2">
      {isLoading ? renderActivitySkeleton() : renderActivityItems()}
    </div>
  );
}
