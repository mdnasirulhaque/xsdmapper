
"use client"

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark as theme } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  code: string;
  language: string;
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
  return (
    <SyntaxHighlighter 
      language={language} 
      style={theme}
      customStyle={{ 
        margin: 0, 
        padding: '1rem',
        backgroundColor: 'transparent',
        fontSize: '0.875rem',
        borderRadius: '0.5rem',
      }}
      codeTagProps={{
        style: {
          fontFamily: 'var(--font-code)',
        }
      }}
    >
      {code}
    </SyntaxHighlighter>
  );
}
