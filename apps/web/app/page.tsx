import Link from "next/link";

export default function Home() {
  return (
    <div className="mt-12 text-center space-y-6">
      <h1 className="text-4xl font-bold text-uasc-navy">UASC Intelligence Agent</h1>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto">
        Hybrid LLM-powered knowledge system for the Unmanned Aerial Systems Center, Dubai Police.
        Upload regulatory documents, then ask questions in English or Arabic.
      </p>
      <div className="flex gap-4 justify-center mt-8">
        <Link
          href="/upload"
          className="px-6 py-3 bg-uasc-navy text-white rounded-lg font-medium hover:bg-opacity-90 transition"
        >
          Upload Documents
        </Link>
        <Link
          href="/chat"
          className="px-6 py-3 border-2 border-uasc-navy text-uasc-navy rounded-lg font-medium hover:bg-uasc-navy hover:text-white transition"
        >
          Ask a Question
        </Link>
      </div>
      <div className="mt-12 grid grid-cols-3 gap-6 text-left">
        {[
          { title: "Bilingual", body: "Arabic and English queries supported via Cohere multilingual embeddings." },
          { title: "Cited Answers", body: "Every response includes source citations with classification badges." },
          { title: "Audit Trail", body: "All queries and retrievals are logged for compliance and accountability." },
        ].map((card) => (
          <div key={card.title} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-uasc-navy mb-2">{card.title}</h3>
            <p className="text-sm text-gray-600">{card.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
