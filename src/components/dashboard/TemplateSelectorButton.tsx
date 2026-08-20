'use client';

import React, { useTransition } from 'react';
import { changeTemplate } from '@/actions/website';
import { Loader2, Check } from 'lucide-react';

export default function TemplateSelectorButton({
  templateId,
  templateName,
  isSelected,
}: {
  templateId: string;
  templateName: string;
  isSelected: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (isSelected || isPending) return;
    startTransition(async () => {
      try {
        await changeTemplate(templateId);
      } catch (err) {
        console.error('Failed to change template:', err);
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isSelected || isPending}
      className={isSelected ? 'btn btn-secondary' : 'btn btn-primary'}
      style={{
        width: '100%',
        fontSize: '0.85rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        opacity: isPending ? 0.75 : 1,
      }}
    >
      {isPending ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          <span>Applying...</span>
        </>
      ) : isSelected ? (
        <>
          <Check size={14} />
          <span>Active Template</span>
        </>
      ) : (
        <span>Apply {templateName}</span>
      )}
    </button>
  );
}
