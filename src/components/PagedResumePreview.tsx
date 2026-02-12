"use client";

import { useRef, useEffect, useState, useCallback, ReactNode } from "react";

// US Letter dimensions at 96 DPI (browser CSS standard)
// 8.5in × 11in = 816px × 1056px
export const PAGE_WIDTH_PX = 816;
export const PAGE_HEIGHT_PX = 1056;

// Effective content height for first page (accounting for 0.1in bottom margin in PDF)
// 11in - 0.1in = 10.9in ≈ 1046px, then adjusted slightly up to align with PDF
const FIRST_PAGE_CONTENT_HEIGHT = 1035;

interface PagedResumePreviewProps {
  children: ReactNode;
  scale?: number;
  showPageNumbers?: boolean;
  className?: string;
}

export function PagedResumePreview({ 
  children, 
  scale = 1,
  showPageNumbers = true,
  className = ""
}: PagedResumePreviewProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(PAGE_HEIGHT_PX);
  const [pageCount, setPageCount] = useState(1);

  const PAGE_COUNT_EPSILON = 80;

  // Calculate content height and page count
  const measureContent = useCallback(() => {
    if (!contentRef.current) return;
    
    const totalHeight = contentRef.current.scrollHeight;
    setContentHeight(totalHeight);
    const pages = Math.max(
      1,
      Math.ceil((totalHeight - PAGE_COUNT_EPSILON) / FIRST_PAGE_CONTENT_HEIGHT)
    );
    setPageCount(pages);
  }, []);

  // Measure on mount and when children change
  useEffect(() => {
    // Use a longer delay to ensure fonts and layout are fully rendered
    const timer = setTimeout(measureContent, 200);
    return () => clearTimeout(timer);
  }, [children, measureContent]);

  // Also measure on window resize
  useEffect(() => {
    window.addEventListener('resize', measureContent);
    return () => window.removeEventListener('resize', measureContent);
  }, [measureContent]);

  // Re-measure periodically for dynamic content
  useEffect(() => {
    const interval = setInterval(measureContent, 500);
    return () => clearInterval(interval);
  }, [measureContent]);

  // Calculate if content fits on one page (using effective content height)
  const fitsOnOnePage = contentHeight <= FIRST_PAGE_CONTENT_HEIGHT + PAGE_COUNT_EPSILON;

  // Always show at least one full page, but extend if content overflows
  // This ensures the "paper" size stays fixed like a real page
  const displayHeight = Math.max(PAGE_HEIGHT_PX, contentHeight);
  const scaledHeight = displayHeight * scale;

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Hidden content to measure total height */}
      <div 
        ref={contentRef}
        className="absolute opacity-0 pointer-events-none"
        style={{ 
          width: `${PAGE_WIDTH_PX}px`,
          position: 'fixed',
          left: '-9999px',
          top: 0,
        }}
      >
        {children}
      </div>

      {/* Single continuous page - no cutting */}
      <div className="relative" style={{ marginBottom: showPageNumbers ? '24px' : '0' }}>
        {/* Page container - fixed page size, extends only if content overflows */}
        <div 
          className="bg-white shadow-xl border border-gray-200 relative overflow-hidden"
          style={{
            width: `${PAGE_WIDTH_PX * scale}px`,
            height: `${scaledHeight}px`,
          }}
        >
          {/* Scaled content wrapper */}
          <div
            style={{
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
              width: `${PAGE_WIDTH_PX}px`,
              minHeight: `${PAGE_HEIGHT_PX}px`,
            }}
          >
            {children}
          </div>
          
          {/* Page boundary indicator - show where page 1 ends if content overflows */}
          <div 
            className="absolute left-0 right-0 pointer-events-none"
            style={{ 
              top: `${FIRST_PAGE_CONTENT_HEIGHT * scale}px`,
            }}
          >
            <div className="relative">
              <div className="border-t-2 border-dashed border-yellow-400"></div>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-50 text-yellow-700 text-xs px-2 py-0.5 rounded border border-yellow-300 whitespace-nowrap">
                Page 1 ends here
              </div>
            </div>
          </div>
        </div>
        
        {/* Page info */}
        {showPageNumbers && (
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap">
            {fitsOnOnePage ? "Page 1 of 1" : `Content spans ${pageCount} pages`}
          </div>
        )}
      </div>
    </div>
  );
}
