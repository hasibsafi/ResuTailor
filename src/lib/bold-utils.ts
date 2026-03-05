import React from "react";

const BOLD_PATTERN = /\*\*(.+?)\*\*/g;

/**
 * Parses **bold** markers in a string and returns React nodes
 * with <strong> elements for bold segments.
 */
export function parseBoldText(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const regex = new RegExp(BOLD_PATTERN.source, "g");
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      React.createElement("strong", { key: `b-${match.index}` }, match[1])
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length === 0 ? text : React.createElement(React.Fragment, null, ...parts);
}

/**
 * Converts **bold** markers to HTML <b> tags for server-side HTML rendering.
 */
export function boldToHtml(text: string): string {
  return text.replace(BOLD_PATTERN, "<b>$1</b>");
}
