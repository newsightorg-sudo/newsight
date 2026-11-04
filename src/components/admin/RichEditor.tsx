'use client';

import React, { useState } from 'react';
import { 
  Heading1, Heading2, Bold, Italic, Quote, List, 
  ListOrdered, Eye, Edit3, Image as ImageIcon, Link as LinkIcon 
} from 'lucide-react';

interface RichEditorProps {
  value: string;
  onChange: (val: string) => void;
}

export default function RichEditor({ value, onChange }: RichEditorProps) {
  const [isPreview, setIsPreview] = useState(false);

  function insertFormatting(prefix: string, suffix: string = '') {
    const textarea = document.getElementById('rich-editor-textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end);

    const replacement = `${prefix}${selected || 'Sample Text'}${suffix}`;
    const newText = text.substring(0, start) + replacement + text.substring(end);
    onChange(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 'Sample Text'.length));
    }, 50);
  }

  return (
    <div className="border border-[#DCE7F2] dark:border-[#27364B] bg-white dark:bg-[#0E131C] rounded-xl overflow-hidden font-sans text-xs shadow-xs">
      {/* Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-1 p-2 bg-[#F0F6FC] dark:bg-[#121925] border-b border-[#DCE7F2] dark:border-[#27364B]">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => insertFormatting('\n## ', '\n')}
            title="Heading 2"
            className="p-1.5 hover:bg-[#E3F0FC] dark:hover:bg-[#1B2432] text-[#174A7E] dark:text-[#A4ADBB] hover:text-[#079FE3] dark:hover:text-[#F5F7FA] rounded-md transition cursor-pointer"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('\n### ', '\n')}
            title="Heading 3"
            className="p-1.5 hover:bg-[#E3F0FC] dark:hover:bg-[#1B2432] text-[#174A7E] dark:text-[#A4ADBB] hover:text-[#079FE3] dark:hover:text-[#F5F7FA] rounded-md transition cursor-pointer"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <span className="text-[#DCE7F2] dark:text-[#252D39]">|</span>
          <button
            type="button"
            onClick={() => insertFormatting('**', '**')}
            title="Bold"
            className="p-1.5 hover:bg-[#E3F0FC] dark:hover:bg-[#1B2432] text-[#174A7E] dark:text-[#A4ADBB] hover:text-[#079FE3] dark:hover:text-[#F5F7FA] rounded-md transition cursor-pointer"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('*', '*')}
            title="Italic"
            className="p-1.5 hover:bg-[#E3F0FC] dark:hover:bg-[#1B2432] text-[#174A7E] dark:text-[#A4ADBB] hover:text-[#079FE3] dark:hover:text-[#F5F7FA] rounded-md transition cursor-pointer"
          >
            <Italic className="w-4 h-4" />
          </button>
          <span className="text-[#DCE7F2] dark:text-[#252D39]">|</span>
          <button
            type="button"
            onClick={() => insertFormatting('\n> ', '\n')}
            title="Blockquote / Pullquote"
            className="p-1.5 hover:bg-[#E3F0FC] dark:hover:bg-[#1B2432] text-[#174A7E] dark:text-[#A4ADBB] hover:text-[#079FE3] dark:hover:text-[#F5F7FA] rounded-md transition cursor-pointer"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('\n- ', '')}
            title="Bullet list"
            className="p-1.5 hover:bg-[#E3F0FC] dark:hover:bg-[#1B2432] text-[#174A7E] dark:text-[#A4ADBB] hover:text-[#079FE3] dark:hover:text-[#F5F7FA] rounded-md transition cursor-pointer"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertFormatting('\n1. ', '')}
            title="Numbered list"
            className="p-1.5 hover:bg-[#E3F0FC] dark:hover:bg-[#1B2432] text-[#174A7E] dark:text-[#A4ADBB] hover:text-[#079FE3] dark:hover:text-[#F5F7FA] rounded-md transition cursor-pointer"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle: Edit vs Preview */}
        <div className="flex items-center gap-1 bg-white dark:bg-[#0E131C] p-0.5 border border-[#DCE7F2] dark:border-[#27364B] rounded-lg">
          <button
            type="button"
            onClick={() => setIsPreview(false)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
              !isPreview
                ? 'bg-[#E3F0FC] dark:bg-[#1A2942] text-[#079FE3]'
                : 'text-[#496784] dark:text-[#A4ADBB] hover:text-[#174A7E]'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Composer</span>
          </button>
          <button
            type="button"
            onClick={() => setIsPreview(true)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
              isPreview
                ? 'bg-[#E3F0FC] dark:bg-[#1A2942] text-[#079FE3]'
                : 'text-[#496784] dark:text-[#A4ADBB] hover:text-[#174A7E]'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>
        </div>
      </div>

      {/* Editor Body Area */}
      {!isPreview ? (
        <textarea
          id="rich-editor-textarea"
          rows={16}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type or paste the complete newsroom dispatch in markdown format..."
          className="w-full p-4 font-sans text-xs text-[#174A7E] dark:text-[#F4F7FB] bg-white dark:bg-[#0E131C] placeholder-[#7890A8] focus:outline-none resize-y leading-relaxed font-normal"
        />
      ) : (
        <div className="p-5 max-h-[500px] overflow-y-auto space-y-3 prose prose-sm dark:prose-invert max-w-none text-xs text-[#174A7E] dark:text-[#F4F7FB]">
          {value ? (
            <div className="space-y-3">
              {value.split('\n\n').map((paragraph, idx) => {
                if (paragraph.startsWith('## ')) {
                  return <h2 key={idx} className="text-base font-bold text-[#174A7E] dark:text-[#F4F7FB] pt-2">{paragraph.replace('## ', '')}</h2>;
                }
                if (paragraph.startsWith('### ')) {
                  return <h3 key={idx} className="text-sm font-bold text-[#1261A6] dark:text-[#079FE3] pt-1">{paragraph.replace('### ', '')}</h3>;
                }
                if (paragraph.startsWith('> ')) {
                  return (
                    <blockquote key={idx} className="border-l-4 border-[#079FE3] pl-4 italic text-[#496784] dark:text-[#B6C3D4] bg-[#F0F6FC] dark:bg-[#121925] p-2 rounded">
                      {paragraph.replace('> ', '')}
                    </blockquote>
                  );
                }
                return <p key={idx} className="leading-relaxed">{paragraph}</p>;
              })}
            </div>
          ) : (
            <p className="text-[#7890A8] italic">No content typed yet. Switch back to Composer to write story body.</p>
          )}
        </div>
      )}
    </div>
  );
}

