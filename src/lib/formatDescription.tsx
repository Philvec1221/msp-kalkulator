import React from 'react';

/**
 * Formats text descriptions by converting bullet points (lines starting with '- ') 
 * into proper HTML lists and preserving paragraphs and line breaks.
 */
export function formatDescription(text: string | null | undefined): React.ReactNode {
  if (!text) return null;

  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];
  let currentParagraph: string[] = [];
  
  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const paragraphText = currentParagraph.join('\n').trim();
      if (paragraphText) {
        elements.push(
          <p key={`p-${elements.length}`} className="mb-2">
            {paragraphText}
          </p>
        );
      }
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="mb-2 ml-4 space-y-1">
          {currentList.map((item, index) => (
            <li key={index} className="list-disc">
              {item}
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith('- ')) {
      // Flush any existing paragraph
      flushParagraph();
      // Add to current list
      currentList.push(trimmedLine.substring(2).trim());
    } else if (trimmedLine === '') {
      // Empty line - flush current list if any, add paragraph break
      flushList();
      flushParagraph();
    } else {
      // Regular text - flush any current list, add to paragraph
      flushList();
      currentParagraph.push(trimmedLine);
    }
  }

  // Flush remaining content
  flushList();
  flushParagraph();

  return elements.length > 0 ? <div className="space-y-2">{elements}</div> : null;
}