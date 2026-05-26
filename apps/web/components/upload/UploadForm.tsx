'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { ClassificationPicker } from './ClassificationPicker';
import { Dropzone } from './Dropzone';
import { TagInput } from './TagInput';
import type { Classification, Language, SourceTier } from '@/lib/types';

export interface UploadPayload {
  file: File;
  classification: Classification;
  sourceTier: SourceTier;
  language: Language;
  tags: string[];
}

export function UploadForm({
  onSubmit,
  onCancel,
}: {
  onSubmit: (payload: UploadPayload) => void | Promise<void>;
  onCancel?: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [classification, setClassification] = useState<Classification | null>('internal');
  const [sourceTier, setSourceTier] = useState<SourceTier>('authoritative');
  const [language, setLanguage] = useState<Language>('en');
  const [tags, setTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const ready = file !== null && classification !== null;

  async function handleSubmit() {
    if (!ready) return;
    setSubmitting(true);
    try {
      await onSubmit({ file: file!, classification: classification!, sourceTier, language, tags });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="relative min-h-full overflow-auto px-5 pt-8 pb-16">
      <div className="relative w-full max-w-[560px] mx-auto flex flex-col gap-3.5">
        <header>
          <h2 className="text-[22px] font-medium text-text-hi m-0">Upload into Ops Intelligence Platform</h2>
          <div className="mt-1 font-mono text-[11px] text-text-dim tracking-[0.04em]">
            SOP · threat report · NOTAM · operational record
          </div>
        </header>

        <Dropzone onFile={setFile} />

        <Field
          label={<>Classification <span className="text-uasc-red ml-1">*</span></>}
          hint="Cannot be changed after submission"
        >
          <ClassificationPicker value={classification} onChange={setClassification} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Source tier">
            <select
              value={sourceTier}
              onChange={e => setSourceTier(e.target.value as SourceTier)}
              className={selectClass}
            >
              <option value="authoritative">Authoritative</option>
              <option value="reference">Reference</option>
              <option value="external">External / public</option>
            </select>
          </Field>
          <Field label="Language">
            <select
              value={language}
              onChange={e => setLanguage(e.target.value as Language)}
              className={selectClass}
            >
              <option value="en">English</option>
              <option value="ar">العربية</option>
              <option value="bilingual">Bilingual</option>
            </select>
          </Field>
        </div>

        <Field label="Tags">
          <TagInput value={tags} onChange={setTags} placeholder="uav, regulation, safety…" />
        </Field>

        <div className="mt-1.5 flex gap-2.5">
          {onCancel && (
            <Button variant="tertiary" onClick={onCancel}>Cancel</Button>
          )}
          <Button
            variant="primary"
            block
            disabled={!ready || submitting}
            onClick={handleSubmit}
          >
            {submitting ? 'Submitting…' : 'Submit to corpus'}
          </Button>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: React.ReactNode;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {hint && (
          <span className="font-mono text-[10px] text-text-faint tracking-[0.04em]">{hint}</span>
        )}
      </div>
      {children}
    </div>
  );
}

const selectClass = cn(
  'w-full appearance-none cursor-pointer',
  'bg-bg-deep border border-border-base text-text-hi rounded',
  'px-3 py-2 pr-8',
  'font-mono text-[12px]',
  'focus:outline-none focus:border-text-hi focus:ring-2 focus:ring-text-hi/10',
);
