import React, { useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import { MOCK_EVIDENCE } from '../data/mockData';

export default function DocumentsPage() {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedDoc, setSelectedDoc] = useState(null);

  const categories = [
    'ALL',
    'Faculty Qualifications',
    'Safety Certificates',
    'Equipment Records',
    'Compliance Documents',
    'Institutional Records',
    'Accreditation Documents'
  ];

  const docs = MOCK_EVIDENCE.documents;
  const filtered = selectedCategory === 'ALL' ? docs : docs.filter(d => d.category === selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-indigo-200">
              Document Intelligence
            </span>
            <span className="text-xs text-slate-400 font-mono">OCR &amp; LayoutLM Verification</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 font-outfit mt-1">
            Institutional Regulatory Documents
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Automated OCR extraction, faculty degree verification, fire safety expiration checks, and equipment invoice audits.
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map((doc) => (
          <div key={doc.id} className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 space-y-4 flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-base border border-indigo-100">
                  <i className="fa-solid fa-file-pdf"></i>
                </div>
                <StatusBadge status={doc.verificationStatus} size="xs" />
              </div>

              <div>
                <h4 className="font-bold text-slate-800 text-sm leading-snug">{doc.name}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{doc.category} • Uploaded {doc.uploadDate}</p>
              </div>

              {/* Extracted JSON box */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs space-y-1">
                <p className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">Extracted OCR Metadata</p>
                {Object.entries(doc.extractedData).map(([k, v], vIdx) => (
                  <div key={vIdx} className="flex justify-between text-[11px]">
                    <span className="text-slate-500 capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                    <strong className="text-slate-800">{v}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
              <span className="text-[10px] text-slate-400 font-mono">{doc.expiryDate}</span>
              <button
                onClick={() => setSelectedDoc(doc)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs transition shadow-sm"
              >
                Inspect OCR Data
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Doc Inspector Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-fadeIn">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-base">{selectedDoc.name}</h3>
                <p className="text-xs text-slate-500">{selectedDoc.category}</p>
              </div>
              <button onClick={() => setSelectedDoc(null)} className="text-slate-400 hover:text-slate-600">
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="font-bold text-slate-700">Raw OCR Schema Payload:</p>
              <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-[11px] overflow-x-auto max-h-60">
                <pre>{JSON.stringify(selectedDoc.extractedData, null, 2)}</pre>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setSelectedDoc(null)} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
