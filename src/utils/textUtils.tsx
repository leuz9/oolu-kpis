import React from 'react';

/**
 * Converts URLs in text to clickable links that open in a new tab
 */
export function renderTextWithLinks(text: string): React.ReactNode {
  if (!text) return text;

  // URL regex pattern - matches http, https, www, and email addresses
  // More comprehensive pattern that handles various URL formats
  const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`\[\]]+|www\.[^\s<>"{}|\\^`\[\]]+|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;
  const matches: Array<{ index: number; url: string }> = [];

  // Collect all matches first
  while ((match = urlRegex.exec(text)) !== null) {
    matches.push({ index: match.index, url: match[0] });
  }

  // Process each match
  matches.forEach((matchData) => {
    // Add text before the URL
    if (matchData.index > lastIndex) {
      const textBefore = text.substring(lastIndex, matchData.index);
      if (textBefore) {
        parts.push(textBefore);
      }
    }

    // Process the URL
    let url = matchData.url;
    let displayUrl = url;

    // Add protocol if missing
    if (url.startsWith('www.')) {
      url = 'https://' + url;
    } else if (!url.startsWith('http://') && !url.startsWith('https://') && url.includes('@')) {
      // Email address
      url = 'mailto:' + url;
    } else if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Clean up URL (remove trailing punctuation that might not be part of the URL)
    url = url.replace(/[.,;:!?]+$/, (match) => {
      displayUrl = displayUrl.slice(0, -match.length);
      return '';
    });

    // Truncate display URL if too long
    if (displayUrl.length > 60) {
      displayUrl = displayUrl.substring(0, 57) + '...';
    }

    // Add the link
    parts.push(
      <a
        key={key++}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary-600 hover:text-primary-700 underline break-all inline"
        onClick={(e) => e.stopPropagation()}
        title={url.startsWith('mailto:') ? url.substring(7) : url}
      >
        {displayUrl}
      </a>
    );

    lastIndex = matchData.index + matchData.url.length;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex);
    if (remainingText) {
      parts.push(remainingText);
    }
  }

  // If no URLs were found, return the original text
  if (parts.length === 0) {
    return text;
  }

  return <>{parts}</>;
}

