import { useState, useEffect, useRef, useCallback } from "react";

const VirtualList = ({
  items = [],
  itemHeight = 80,
  containerHeight = 600,
  renderItem,
  overscan = 3,
  className = "",
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.ceil((scrollTop + containerHeight) / itemHeight);

  const startIndex = Math.max(0, visibleStart - overscan);
  const endIndex = Math.min(items.length, visibleEnd + overscan);

  const visibleItems = items.slice(startIndex, endIndex);

  const totalHeight = items.length * itemHeight;

  const offsetY = startIndex * itemHeight;

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  const scrollToIndex = useCallback(
    (index) => {
      if (containerRef.current) {
        const scrollTop = index * itemHeight;
        containerRef.current.scrollTop = scrollTop;
      }
    },
    [itemHeight]
  );

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => {
            const actualIndex = startIndex + index;
            return (
              <div key={item.id || actualIndex} style={{ height: itemHeight }}>
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VirtualList;
