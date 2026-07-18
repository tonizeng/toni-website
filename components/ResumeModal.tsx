"use client";

export default function ResumeModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
      onClick={onClose}
    >
      <div
        className="relative flex h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3">
          <span className="font-semibold text-brand-red">toni&apos;s resume</span>
          <div className="flex items-center gap-4">
            <a
              href="/tonizengresume.pdf"
              download
              className="text-sm text-brand-red underline underline-offset-2 hover:text-brand-red/80"
            >
              download
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100"
            >
              ✕
            </button>
          </div>
        </div>
        <iframe src="/tonizengresume.pdf" className="flex-1" title="Resume" />
      </div>
    </div>
  );
}
