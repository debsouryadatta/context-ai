import { useState, useRef, useEffect, ReactNode } from "react";

interface ResizableContainerProps {
  children: ReactNode;
  dimensions: { width: number; height: number };
  onDimensionsChange: (width: number, height: number) => Promise<void>;
  className?: string;
  minWidth?: number;
  minHeight?: number;
  handlePosition?: "top-left" | "bottom-right";
}

const ResizableContainer = ({
  children,
  dimensions,
  onDimensionsChange,
  className = "",
  minWidth = 300,
  minHeight = 400,
  handlePosition = "top-left"
}: ResizableContainerProps) => {
  const resizeRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [currentDimensions, setCurrentDimensions] = useState(dimensions);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });
  const [initialDimensions, setInitialDimensions] = useState({ width: 0, height: 0 });

  // Handle resize events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      let deltaX, deltaY, newWidth, newHeight;
      
      if (handlePosition === "top-left") {
        // Calculate the delta from the start position
        deltaX = startPosition.x - e.clientX;
        deltaY = startPosition.y - e.clientY;
        
        // Calculate new dimensions based on the delta and initial dimensions
        newWidth = Math.max(minWidth, initialDimensions.width + deltaX);
        newHeight = Math.max(minHeight, initialDimensions.height + deltaY);
      } else {
        // Bottom-right handle calculations
        deltaX = e.clientX - startPosition.x;
        deltaY = e.clientY - startPosition.y;
        
        newWidth = Math.max(minWidth, initialDimensions.width + deltaX);
        newHeight = Math.max(minHeight, initialDimensions.height + deltaY);
      }
      
      // Use requestAnimationFrame for smoother updates
      requestAnimationFrame(() => {
        setCurrentDimensions({ width: newWidth, height: newHeight });
      });
    };
    
    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        // Save the new dimensions when resizing ends
        onDimensionsChange(currentDimensions.width, currentDimensions.height);
      }
    };
    
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      // Add a class to the body to prevent text selection during resize
      document.body.classList.add('resize-active');
      
      // Add a style to disable transitions during resize for better performance
      const containerElement = resizeRef.current?.parentElement;
      if (containerElement) {
        containerElement.style.transition = 'none';
      }
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.classList.remove('resize-active');
      
      // Restore transitions when not resizing
      const containerElement = resizeRef.current?.parentElement;
      if (containerElement) {
        containerElement.style.transition = '';
      }
    };
  }, [isResizing, startPosition, initialDimensions, currentDimensions, onDimensionsChange, minWidth, minHeight, handlePosition]);

  // Update local dimensions when props change
  useEffect(() => {
    setCurrentDimensions(dimensions);
  }, [dimensions]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Store the initial mouse position
    setStartPosition({ x: e.clientX, y: e.clientY });
    
    // Store the initial dimensions
    setInitialDimensions({
      width: currentDimensions.width,
      height: currentDimensions.height
    });
    
    setIsResizing(true);
  };

  // Determine the position and cursor style for the resize handle
  const handleStyles = {
    position: "absolute",
    width: "16px",
    height: "16px",
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    ...(handlePosition === "top-left" 
      ? { 
          top: 0, 
          left: 0, 
          cursor: "nwse-resize" 
        } 
      : { 
          bottom: 0, 
          right: 0, 
          cursor: "nwse-resize" 
        })
  };

  return (
    <div 
      className={`relative ${className}`}
      style={{ 
        width: `${currentDimensions.width}px`, 
        height: `${currentDimensions.height}px`,
        willChange: isResizing ? 'width, height' : 'auto'
      }}
    >
      {children}
      
      {/* Resize Handle */}
      <div 
        ref={resizeRef}
        style={handleStyles as React.CSSProperties}
        onMouseDown={handleResizeStart}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="text-white opacity-70 hover:opacity-100"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2h-4"></path>
          <path d="M3 9V5a2 2 0 0 1 2-2h4"></path>
          <path d="M21 9L3 21"></path>
        </svg>
      </div>
    </div>
  );
};

export default ResizableContainer;
