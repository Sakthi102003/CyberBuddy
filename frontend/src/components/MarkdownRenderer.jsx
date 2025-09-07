import { useMemo } from 'react';

// Enhanced text formatter that handles comprehensive markdown-like formatting
export default function MarkdownRenderer({ content, className = '' }) {
  // Sanitize text to prevent XSS attacks
  const sanitizeText = (text) => {
    if (!text || typeof text !== 'string') return text;
    
    // Basic sanitization - remove potentially dangerous HTML tags and scripts
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  };

  // Enhanced inline formatting parser with better conflict resolution
  const parseInlineFormatting = (text) => {
    if (!text || typeof text !== 'string') {
      return text;
    }

    // Sanitize the text
    const sanitizedText = sanitizeText(text);
    
    // Process formatting in order of precedence to avoid conflicts
    let processedText = sanitizedText;
    const elements = [];
    let key = 0;

    // Step 1: Process code spans first (highest priority)
    const codeMatches = [];
    processedText = processedText.replace(/`([^`]+)`/g, (match, content, offset) => {
      const placeholder = `__CODE_${codeMatches.length}__`;
      codeMatches.push({ content, offset, length: match.length });
      return placeholder;
    });

    // Step 2: Process links
    const linkMatches = [];
    processedText = processedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, linkText, url, offset) => {
      const placeholder = `__LINK_${linkMatches.length}__`;
      linkMatches.push({ linkText, url, offset, length: match.length });
      return placeholder;
    });

    // Step 3: Process bold (before italic to avoid conflicts)
    const boldMatches = [];
    processedText = processedText.replace(/\*\*([^*\n]+?)\*\*/g, (match, content, offset) => {
      const placeholder = `__BOLD_${boldMatches.length}__`;
      boldMatches.push({ content, offset, length: match.length });
      return placeholder;
    });

    // Step 4: Process strikethrough
    const strikeMatches = [];
    processedText = processedText.replace(/~~([^~\n]+?)~~/g, (match, content, offset) => {
      const placeholder = `__STRIKE_${strikeMatches.length}__`;
      strikeMatches.push({ content, offset, length: match.length });
      return placeholder;
    });

    // Step 5: Process italic (single * and _) with careful boundary detection
    const italicAsteriskMatches = [];
    processedText = processedText.replace(/(?:^|[\s\W])\*([^*\n]+?)\*(?=[\s\W]|$)/g, (match, content, offset) => {
      // Only process if content doesn't contain asterisks and isn't empty
      if (content && content.trim() && !content.includes('*')) {
        const placeholder = `__ITALIC_A_${italicAsteriskMatches.length}__`;
        italicAsteriskMatches.push({ content, offset, length: match.length });
        return match.replace(`*${content}*`, placeholder);
      }
      return match;
    });

    const italicUnderscoreMatches = [];
    processedText = processedText.replace(/(?:^|[\s\W])_([^_\n]+?)_(?=[\s\W]|$)/g, (match, content, offset) => {
      // Only process if content doesn't contain underscores and isn't empty
      if (content && content.trim() && !content.includes('_')) {
        const placeholder = `__ITALIC_U_${italicUnderscoreMatches.length}__`;
        italicUnderscoreMatches.push({ content, offset, length: match.length });
        return match.replace(`_${content}_`, placeholder);
      }
      return match;
    });

    // Now rebuild the text with React elements
    let result = processedText;

    // Replace placeholders with React elements
    // Code spans
    codeMatches.forEach((item, index) => {
      result = result.replace(`__CODE_${index}__`, `||CODE_${index}||`);
    });

    // Links
    linkMatches.forEach((item, index) => {
      result = result.replace(`__LINK_${index}__`, `||LINK_${index}||`);
    });

    // Bold
    boldMatches.forEach((item, index) => {
      result = result.replace(`__BOLD_${index}__`, `||BOLD_${index}||`);
    });

    // Strikethrough
    strikeMatches.forEach((item, index) => {
      result = result.replace(`__STRIKE_${index}__`, `||STRIKE_${index}||`);
    });

    // Italic asterisk
    italicAsteriskMatches.forEach((item, index) => {
      result = result.replace(`__ITALIC_A_${index}__`, `||ITALIC_A_${index}||`);
    });

    // Italic underscore
    italicUnderscoreMatches.forEach((item, index) => {
      result = result.replace(`__ITALIC_U_${index}__`, `||ITALIC_U_${index}||`);
    });

    // Split by markers and create React elements
    const parts = result.split(/(\|\|[^|]+\|\|)/);
    const finalResult = [];

    parts.forEach(part => {
      if (part.startsWith('||') && part.endsWith('||')) {
        const marker = part.slice(2, -2);
        
        if (marker.startsWith('CODE_')) {
          const index = parseInt(marker.replace('CODE_', ''));
          const item = codeMatches[index];
          finalResult.push(
            <code key={key++} className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm font-mono text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600">
              {item.content}
            </code>
          );
        } else if (marker.startsWith('LINK_')) {
          const index = parseInt(marker.replace('LINK_', ''));
          const item = linkMatches[index];
          finalResult.push(
            <a 
              key={key++} 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline transition-colors"
            >
              {item.linkText}
            </a>
          );
        } else if (marker.startsWith('BOLD_')) {
          const index = parseInt(marker.replace('BOLD_', ''));
          const item = boldMatches[index];
          finalResult.push(
            <strong key={key++} className="font-bold text-gray-900 dark:text-gray-100">
              {item.content}
            </strong>
          );
        } else if (marker.startsWith('STRIKE_')) {
          const index = parseInt(marker.replace('STRIKE_', ''));
          const item = strikeMatches[index];
          finalResult.push(
            <del key={key++} className="line-through text-gray-600 dark:text-gray-400">
              {item.content}
            </del>
          );
        } else if (marker.startsWith('ITALIC_A_')) {
          const index = parseInt(marker.replace('ITALIC_A_', ''));
          const item = italicAsteriskMatches[index];
          finalResult.push(
            <em key={key++} className="italic text-gray-900 dark:text-gray-100">
              {item.content}
            </em>
          );
        } else if (marker.startsWith('ITALIC_U_')) {
          const index = parseInt(marker.replace('ITALIC_U_', ''));
          const item = italicUnderscoreMatches[index];
          finalResult.push(
            <em key={key++} className="italic text-gray-900 dark:text-gray-100">
              {item.content}
            </em>
          );
        }
      } else if (part) {
        finalResult.push(part);
      }
    });

    return finalResult.length > 0 ? finalResult : sanitizedText;
  };

  // Render table from table rows
  const renderTable = (rows, key) => {
    const processedRows = rows
      .filter(row => row.trim() && !row.trim().match(/^[\s|:-]+$/))
      .map(row => 
        row.split('|')
          .map(cell => cell.trim())
          .filter((cell, index, arr) => index > 0 && index < arr.length - 1)
      );

    if (processedRows.length === 0) return null;

    const [headerRow, ...dataRows] = processedRows;

    return (
      <div key={key} className="mb-4 overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
          <thead className="bg-gray-100 dark:bg-gray-700">
            <tr>
              {headerRow.map((cell, index) => (
                <th key={index} className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-left font-semibold text-gray-900 dark:text-gray-100">
                  {parseInlineFormatting(cell)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, rowIndex) => (
              <tr key={rowIndex} className="even:bg-gray-50 dark:even:bg-gray-800">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-gray-100">
                    {parseInlineFormatting(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Parse the text and convert markdown to JSX
  const parseText = (text) => {
    const sanitizedText = sanitizeText(text);
    const lines = sanitizedText.split('\n');
    const elements = [];
    let currentKey = 0;
    let inCodeBlock = false;
    let codeLanguage = '';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();
      
      // Handle empty lines
      if (trimmedLine === '' && !inCodeBlock) {
        elements.push(<div key={currentKey++} className="h-2" />);
        continue;
      }

      // Handle code blocks
      if (trimmedLine.startsWith('```')) {
        if (!inCodeBlock) {
          // Starting code block
          inCodeBlock = true;
          codeLanguage = trimmedLine.replace('```', '').trim();
          const codeLines = [];
          i++; // Skip the opening ```
          
          while (i < lines.length && !lines[i].trim().startsWith('```')) {
            codeLines.push(lines[i]);
            i++;
          }
          
          elements.push(
            <div key={currentKey++} className="mb-4">
              {codeLanguage && (
                <div className="bg-gray-200 dark:bg-gray-600 px-3 py-1 text-xs font-mono text-gray-700 dark:text-gray-300 rounded-t-lg border-b border-gray-300 dark:border-gray-500">
                  {codeLanguage}
                </div>
              )}
              <pre className={`bg-gray-100 dark:bg-gray-700 ${codeLanguage ? 'rounded-b-lg' : 'rounded-lg'} p-4 overflow-x-auto border border-gray-200 dark:border-gray-600`}>
                <code className="text-sm font-mono text-gray-800 dark:text-gray-200 whitespace-pre">
                  {codeLines.join('\n')}
                </code>
              </pre>
            </div>
          );
          inCodeBlock = false;
          continue;
        }
      }

      if (inCodeBlock) continue;

      // Handle blockquotes
      if (trimmedLine.startsWith('>')) {
        const quoteContent = line.replace(/^\s*>\s?/, '');
        elements.push(
          <blockquote key={currentKey++} className="border-l-4 border-blue-500 pl-4 my-3 bg-blue-50 dark:bg-blue-900/20 py-2 rounded-r-lg">
            <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed">
              {parseInlineFormatting(quoteContent)}
            </p>
          </blockquote>
        );
        continue;
      }

      // Handle headers with better hierarchy
      const headerMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const headerText = headerMatch[2];
        const HeaderTag = `h${level}`;
        
        const headerClasses = {
          1: "text-2xl font-bold mb-4 mt-6 text-gray-900 dark:text-gray-100 border-b border-gray-300 dark:border-gray-600 pb-2",
          2: "text-xl font-bold mb-3 mt-5 text-gray-900 dark:text-gray-100",
          3: "text-lg font-semibold mb-2 mt-4 text-gray-900 dark:text-gray-100",
          4: "text-base font-semibold mb-2 mt-3 text-gray-900 dark:text-gray-100",
          5: "text-sm font-semibold mb-1 mt-2 text-gray-900 dark:text-gray-100",
          6: "text-xs font-semibold mb-1 mt-2 text-gray-700 dark:text-gray-300"
        };

        elements.push(
          <HeaderTag key={currentKey++} className={headerClasses[level]}>
            {parseInlineFormatting(headerText)}
          </HeaderTag>
        );
        continue;
      }

      // Handle unordered lists with nested support
      const bulletMatch = line.match(/^(\s*)([-*+])\s+(.+)$/);
      if (bulletMatch) {
        const indent = bulletMatch[1].length;
        const content = bulletMatch[3];
        const marginLeft = indent > 0 ? `${indent * 0.75}rem` : '0';
        
        elements.push(
          <div key={currentKey++} className="flex items-start mb-1" style={{ marginLeft }}>
            <span className="text-blue-500 dark:text-blue-400 mr-2 mt-1 font-bold">•</span>
            <span className="text-gray-900 dark:text-gray-100 leading-relaxed flex-1">
              {parseInlineFormatting(content)}
            </span>
          </div>
        );
        continue;
      }

      // Handle ordered lists with nested support
      const numberedMatch = line.match(/^(\s*)(\d+\.)\s+(.+)$/);
      if (numberedMatch) {
        const indent = numberedMatch[1].length;
        const number = numberedMatch[2];
        const content = numberedMatch[3];
        const marginLeft = indent > 0 ? `${indent * 0.75}rem` : '0';
        
        elements.push(
          <div key={currentKey++} className="flex items-start mb-1" style={{ marginLeft }}>
            <span className="text-blue-600 dark:text-blue-400 mr-2 mt-1 font-medium min-w-[1.5rem]">
              {number}
            </span>
            <span className="text-gray-900 dark:text-gray-100 leading-relaxed flex-1">
              {parseInlineFormatting(content)}
            </span>
          </div>
        );
        continue;
      }

      // Handle horizontal rules
      if (/^[-*_]{3,}$/.test(trimmedLine)) {
        elements.push(
          <hr key={currentKey++} className="my-6 border-gray-300 dark:border-gray-600" />
        );
        continue;
      }

      // Handle tables (basic support)
      if (trimmedLine.includes('|') && trimmedLine.split('|').length > 2) {
        const tableRows = [line];
        let j = i + 1;
        
        // Collect consecutive table rows
        while (j < lines.length && lines[j].trim().includes('|')) {
          tableRows.push(lines[j]);
          j++;
        }
        
        if (tableRows.length > 1) {
          elements.push(renderTable(tableRows, currentKey++));
          i = j - 1; // Skip processed rows
          continue;
        }
      }

      // Regular paragraph
      if (trimmedLine.length > 0) {
        elements.push(
          <p key={currentKey++} className="mb-3 leading-relaxed text-gray-900 dark:text-gray-100">
            {parseInlineFormatting(line)}
          </p>
        );
      }
    }

    return elements;
  };

  // Memoize the parsed content to avoid re-parsing on every render
  const parsedContent = useMemo(() => {
    if (!content || typeof content !== 'string') {
      return <span>{content || ''}</span>;
    }

    return parseText(content);
  }, [content]);

  return (
    <div className={`prose prose-sm max-w-none dark:prose-invert ${className}`}>
      {parsedContent}
    </div>
  );
}
