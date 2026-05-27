'use client';

interface DeleteConfirmModalProps {
  open: boolean;
  docId: string;
  docTitle: string;
  onCancel: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteConfirmModal({
  open,
  docId,
  docTitle,
  onCancel,
  onConfirm,
  isDeleting,
}: DeleteConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-[rgba(10,13,18,0.7)] backdrop-blur-[4px] z-[100] flex items-center justify-center"
      onClick={e => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="bg-surf-1 border border-border-hi rounded-lg p-6 max-w-[460px] w-[calc(100%-40px)] shadow-[0_24px_60px_rgba(0,0,0,0.6)]">
        <h3 className="m-0 mb-2 text-[16px] font-medium text-text-hi">
          Remove document from library?
        </h3>
        <p className="text-text-mid text-[13px] m-0 mb-4">
          The document and its embeddings will be deleted from the intelligence database. Existing
          chat answers that cite it will retain the citation as a tombstone.
        </p>
        <div className="bg-bg-deep border border-border-base px-3 py-2.5 rounded-[3px] mb-4 font-mono text-[12px] text-text-hi">
          {docId} — {docTitle}
        </div>
        <div className="font-mono text-[11px] text-uasc-amber mb-4 border-l-2 border-uasc-amber pl-2.5 leading-relaxed">
          This action is logged to the audit log and cannot be undone. Re-uploading creates a new
          document with a new ID in the intelligence database.
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 px-3.5 py-2 border border-transparent bg-transparent text-text-mid text-[13px] font-medium rounded cursor-pointer transition-all duration-120 hover:text-text-hi hover:bg-surf-1 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 px-3.5 py-2 border border-uasc-red bg-uasc-red text-bg-base text-[13px] font-medium rounded cursor-pointer transition-all duration-120 hover:bg-[#e88780] hover:border-[#e88780] disabled:opacity-50"
          >
            {isDeleting ? 'Removing…' : 'Remove from library'}
          </button>
        </div>
      </div>
    </div>
  );
}
