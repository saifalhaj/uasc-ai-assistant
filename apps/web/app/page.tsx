import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center text-center pt-16 pb-12 space-y-10">
      <Image
        src="/UASCLogoWhite.png"
        alt="UASC Logo"
        width={220}
        height={220}
        priority
        className="opacity-90"
      />

      <div className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-wide text-uasc-text">
          Intelligence Agent
        </h1>
        <p className="text-sm text-uasc-sub max-w-xl mx-auto leading-relaxed">
          Hybrid LLM-powered knowledge system for the Unmanned Aerial Systems Center, Dubai Police.
          Upload regulatory documents, then ask questions in English or Arabic.
        </p>
      </div>

      <div className="flex gap-4">
        <Link
          href="/upload"
          className="px-6 py-2.5 bg-uasc-text text-uasc-bg rounded font-medium text-sm hover:opacity-90 transition"
        >
          Upload Documents
        </Link>
        <Link
          href="/chat"
          className="px-6 py-2.5 border border-uasc-border text-uasc-sub rounded font-medium text-sm hover:text-uasc-text hover:border-uasc-sub transition"
        >
          Ask a Question
        </Link>
      </div>

      <div className="w-full max-w-2xl grid grid-cols-3 gap-4 pt-4 text-left">
        {[
          { title: "Bilingual", body: "Arabic and English via Cohere multilingual embeddings." },
          { title: "Cited Answers", body: "Every response includes source citations and classification badges." },
          { title: "Audit Trail", body: "All queries and retrievals are logged for compliance." },
        ].map((card) => (
          <div key={card.title} className="bg-uasc-card border border-uasc-border rounded p-4">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-uasc-sub mb-2">{card.title}</h3>
            <p className="text-xs text-uasc-muted leading-relaxed">{card.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
