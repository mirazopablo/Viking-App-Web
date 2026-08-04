'use client';

import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { DynamicContentBlock } from '@/types/budget';

interface BudgetDocumentBlocksProps {
  blocks?: DynamicContentBlock[];
}

export const BudgetDocumentBlocks: React.FC<BudgetDocumentBlocksProps> = ({ blocks = [] }) => {
  if (blocks.length === 0) return null;

  return (
    <div className="space-y-4">
      {blocks.map((block) => {
        if (block.type === 'TEXT_PARAGRAPH') {
          return (
            <div key={block.id} className="space-y-1">
              {block.title && (
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/80">
                  {block.title}
                </h4>
              )}
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                {block.content || 'No text content provided.'}
              </p>
            </div>
          );
        }

        if (block.type === 'BULLET_LIST') {
          return (
            <div key={block.id} className="space-y-1.5">
              {block.title && (
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground/80">
                  {block.title}
                </h4>
              )}
              <ul className="space-y-1 pl-1">
                {(block.items || []).map((item, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        }

        if (block.type === 'WARNING_NOTE') {
          const severity = block.severity || 'warning';
          return (
            <div
              key={block.id}
              className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                severity === 'info'
                  ? 'bg-blue-500/10 border-blue-500/20 text-blue-900 dark:text-blue-200'
                  : severity === 'warning'
                  ? 'bg-amber-500/10 border-amber-500/20 text-amber-900 dark:text-amber-200'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-900 dark:text-rose-200'
              }`}
            >
              {severity === 'info' && <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />}
              {severity === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
              {severity === 'important' && <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />}
              <div className="space-y-0.5">
                {block.title && <h5 className="font-bold text-xs">{block.title}</h5>}
                <p className="leading-relaxed">{block.content}</p>
              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
};
