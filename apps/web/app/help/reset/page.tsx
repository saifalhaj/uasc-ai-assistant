export default function PasswordResetPage() {
  return (
    <div className="grid place-items-center min-h-full px-5">
      <div className="w-full max-w-[480px] flex flex-col gap-5 text-center">

        <div className="flex flex-col gap-2">
          <h1 className="text-[22px] font-medium text-text-hi m-0 tracking-[-0.01em]">
            Account Reset
          </h1>
          <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-text-dim m-0">
            AUTH · ACCESS MANAGEMENT
          </p>
        </div>

        <div className="border border-border-base bg-surf-1 rounded p-6 flex flex-col gap-4">
          <div className="w-10 h-10 mx-auto border border-uasc-amber rounded-[3px] flex items-center justify-center">
            <span className="font-mono text-[16px] text-uasc-amber">!</span>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-text-hi text-[14px] font-medium m-0">
              Self-service reset is not available
            </p>
            <p className="text-text-mid text-[13px] leading-relaxed m-0">
              Account credentials and access levels are managed centrally. To reset your passphrase or change your clearance level, contact your station lead or system administrator.
            </p>
          </div>
        </div>

        <div className="border border-border-base bg-surf-1 rounded divide-y divide-border-base text-left">
          <div className="px-4 py-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-dim">
              Contact channel
            </span>
            <p className="text-text-hi text-[13px] mt-1 mb-0 font-medium">
              Station Lead · UASC Operations
            </p>
          </div>
          <div className="px-4 py-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-dim">
              Reference
            </span>
            <p className="font-mono text-[12px] text-text-mid mt-1 mb-0">
              SOP-AUTH-001 · Access Management Procedures
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
