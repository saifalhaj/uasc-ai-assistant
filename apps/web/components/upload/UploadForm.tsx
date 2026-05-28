'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { ClassificationPicker } from './ClassificationPicker';
import { Dropzone } from './Dropzone';
import { TagInput } from './TagInput';
import type { Classification, DocType, Language } from '@/lib/types';

export interface UploadPayload {
  file: File;
  classification: Classification;
  docType: DocType;
  language: Language;
  tags: string[];
}

export function UploadForm({
  onSubmit,
  onCancel,
  hideHeader = false,
  canSelectRestricted = true,
}: {
  onSubmit: (payload: UploadPayload) => void | Promise<void>;
  onCancel?: () => void;
  /** When true, suppresses the built-in header (title + subtitle).
   *  Use this when the parent page renders its own header. */
  hideHeader?: boolean;
  /** When false, the RESTRICTED classification option is hidden (L4-only). */
  canSelectRestricted?: boolean;
}) {
  const [file, setFile]               = useState<File | null>(null);
  const [classification, setClassification] = useState<Classification | null>('internal');
  const [docType, setDocType]         = useState<DocType>('sop');
  const [language, setLanguage]       = useState<Language>('en');
  const [tags, setTags]               = useState<string[]>([]);
  const [submitting, setSubmitting]   = useState(false);

  const ready = file !== null && classification !== null;

  async function handleSubmit() {
    if (!ready) return;
    setSubmitting(true);
    try {
      await onSubmit({ file: file!, classification: classification!, docType, language, tags });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="relative min-h-full overflow-auto px-5 pt-8 pb-16">
      <div className="relative w-full max-w-[560px] mx-auto flex flex-col gap-3.5">
        {!hideHeader && (
          <header>
            <h2 className="text-[22px] font-medium text-text-hi m-0 uppercase tracking-[0.04em]">
              UPLOAD INTO OPS INTELLIGENCE PLATFORM
            </h2>
          </header>
        )}

        <Dropzone onFile={setFile} />

        <Field label={<>Classification <span className="text-uasc-red ml-1">*</span></>}>
          <ClassificationPicker
            value={classification}
            onChange={setClassification}
            canSelectRestricted={canSelectRestricted}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Type of doc">
            <select
              value={docType}
              onChange={e => setDocType(e.target.value as DocType)}
              className={selectClass}
            >
              <option value="law-regulation">Law &amp; Regulation</option>
              <option value="sop">SOP</option>
              <option value="report">Report</option>
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
            {submitting ? 'Submitting…' : 'Submit to intelligence database'}
          </Button>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
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
