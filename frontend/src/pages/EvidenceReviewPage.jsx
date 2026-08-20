import React, { useState } from 'react';
import StatusBadge from '../components/StatusBadge';
import { MOCK_EVIDENCE } from '../data/mockData';

export default function EvidenceReviewPage({ evidence = MOCK_EVIDENCE }) {
  const [activeTab, setActiveTab] = useState('visual'); // visual | technical | documents
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedDocData, setSelectedDocData] = useState(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-100 text-indigo-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-indigo-200">
              Multi-Source Evidence Lake
            </span>
            <span className="text-xs text-slate-400 font-mono">Real-Time Aggregation</span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 font-outfit mt-1">
            Multi-Modal Evidence Review
          </h2>
          <p className="text-xs md:text-sm text-slate-500 mt-0.5">
            Cross-examine CCTV computer vision detections, live subnet network discoveries, and OCR document extractions.
          </p>
        </div>

        {/* Source Switcher Tab */}
        <div className="flex p-1 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('visual')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'visual' ? 'bg-white text-indigo-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <i className="fa-solid fa-video text-indigo-500"></i>
            <span>Visual (CCTV)</span>
          </button>
          <button
            onClick={() => setActiveTab('technical')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'technical' ? 'bg-white text-indigo-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <i className="fa-solid fa-network-wired text-indigo-500"></i>
            <span>Technical (Scanner)</span>
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'documents' ? 'bg-white text-indigo-700 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <i className="fa-solid fa-file-invoice text-indigo-500"></i>
            <span>Document (OCR)</span>
          </button>
        </div>
      </div>

      {/* SOURCE A: VISUAL EVIDENCE */}
      {activeTab === 'visual' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {evidence.visual.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col justify-between">
                <div>
                  {/* CCTV Frame with YOLO bounding simulation */}
                  <div className="relative bg-slate-950 aspect-video overflow-hidden group">
                    <img
                      src={item.imageUrl}
                      alt={item.location}
                      className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Simulated YOLO Bounding Box Overlay */}
                    <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-white text-[11px] font-mono flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                      <span>LIVE FEED: {item.camera}</span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-700/80 text-white text-xs flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-100">{item.location}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{item.timestamp}</p>
                      </div>
                      <span className="bg-indigo-600/80 text-indigo-200 px-2 py-0.5 rounded text-[10px] font-bold">
                        {item.model}
                      </span>
                    </div>
                  </div>

                  {/* Detection Breakdown */}
                  <div className="p-5 space-y-4">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Object Detection Detections</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {item.detections.map((det, dIdx) => (
                          <div key={dIdx} className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-center">
                            <p className="text-[10px] text-slate-500 font-medium truncate">{det.label}</p>
                            <p className="text-lg font-extrabold text-indigo-700 font-outfit mt-0.5">{det.count}</p>
                            <p className="text-[9px] text-emerald-600 font-semibold">{det.conf} Conf</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-indigo-50/60 border border-indigo-100 p-3 rounded-xl text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                        <i className="fa-solid fa-brain text-indigo-600"></i>
                        <span>AI Inference Remarks:</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed text-[11px]">{item.aiRemarks}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-xs">
                  <StatusBadge status={item.status} size="xs" />
                  <button 
                    onClick={() => setSelectedImage(item)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold text-xs transition flex items-center gap-1.5"
                  >
                    <i className="fa-solid fa-expand text-[10px]"></i>
                    <span>Inspect Raw Frame</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SOURCE B: TECHNICAL EVIDENCE */}
      {activeTab === 'technical' && (
        <div className="space-y-6">
          {evidence.technical.map((tech) => (
            <div key={tech.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-3 gap-2">
                <div>
                  <h3 className="font-bold text-slate-800 text-base font-outfit">Subnet Telemetry Discovery Sweeper</h3>
                  <p className="text-xs text-slate-500 font-mono">{tech.scope} • Agent: {tech.agentType}</p>
                </div>
                <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full border border-emerald-200">
                  Last Sweep: {tech.lastSeen}
                </span>
              </div>

              {/* Counts */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-center">
                  <p className="text-xs text-slate-500 font-semibold">Declared PCs</p>
                  <p className="text-2xl font-bold text-slate-800 font-outfit mt-0.5">{tech.declaredCount}</p>
                </div>
                <div className="bg-indigo-50 border border-indigo-100 p-3.5 rounded-xl text-center">
                  <p className="text-xs text-indigo-600 font-semibold">Discovered on LAN</p>
                  <p className="text-2xl font-bold text-indigo-700 font-outfit mt-0.5">{tech.discoveredCount}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 p-3.5 rounded-xl text-center">
                  <p className="text-xs text-emerald-600 font-semibold">Active Online</p>
                  <p className="text-2xl font-bold text-emerald-700 font-outfit mt-0.5">{tech.onlineCount}</p>
                </div>
                <div className="bg-rose-50 border border-rose-100 p-3.5 rounded-xl text-center">
                  <p className="text-xs text-rose-600 font-semibold">Offline Discrepancy</p>
                  <p className="text-2xl font-bold text-rose-700 font-outfit mt-0.5">{tech.offlineCount}</p>
                </div>
              </div>

              {/* Sample Discovery Hosts */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Live Agent Discovery Samples</h4>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold text-[10px]">
                        <th className="p-3">Hostname</th>
                        <th className="p-3">IP Address</th>
                        <th className="p-3">Operating System</th>
                        <th className="p-3">Live CPU</th>
                        <th className="p-3">Live RAM</th>
                        <th className="p-3">Agent Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tech.sampleHosts.map((h, hIdx) => (
                        <tr key={hIdx} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-800">{h.hostname}</td>
                          <td className="p-3 font-mono text-slate-600">{h.ip}</td>
                          <td className="p-3 text-slate-700">{h.os}</td>
                          <td className="p-3 font-mono text-indigo-600 font-bold">{h.cpu}</td>
                          <td className="p-3 font-mono text-indigo-600 font-bold">{h.ram}</td>
                          <td className="p-3"><StatusBadge status={h.status} size="xs" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SOURCE C: DOCUMENT EVIDENCE */}
      {activeTab === 'documents' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {evidence.documents.map((doc) => (
            <div key={doc.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-base">
                    <i className="fa-solid fa-file-pdf"></i>
                  </div>
                  <StatusBadge status={doc.verificationStatus} size="xs" />
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 text-sm leading-snug">{doc.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{doc.category} • Uploaded {doc.uploadDate}</p>
                </div>

                {/* Extracted Highlights */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs space-y-1.5">
                  <p className="font-bold text-[10px] text-slate-400 uppercase tracking-wider">OCR Extracted Information</p>
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
                  onClick={() => setSelectedDocData(doc)}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs shadow-sm transition"
                >
                  Inspect OCR
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Raw Frame Inspection Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 text-white max-w-4xl w-full rounded-2xl overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base">{selectedImage.camera}: {selectedImage.location}</h3>
                <p className="text-xs text-slate-400 font-mono">{selectedImage.timestamp} • {selectedImage.model}</p>
              </div>
              <button onClick={() => setSelectedImage(null)} className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-slate-700">
              <img src={selectedImage.imageUrl} alt="Frame" className="w-full object-cover max-h-[60vh]" />
            </div>

            <div className="p-3 bg-slate-800/80 rounded-xl text-xs flex justify-between items-center">
              <span>Overall AI Object Detection Confidence: <strong className="text-emerald-400">{(selectedImage.confidence * 100).toFixed(1)}%</strong></span>
              <button onClick={() => setSelectedImage(null)} className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg font-semibold">
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OCR Inspector Modal */}
      {selectedDocData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden p-6 space-y-4 animate-fadeIn">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-800 text-base">{selectedDocData.name}</h3>
                <p className="text-xs text-slate-500">{selectedDocData.category}</p>
              </div>
              <button onClick={() => setSelectedDocData(null)} className="text-slate-400 hover:text-slate-600">
                <i className="fa-solid fa-xmark text-lg"></i>
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-[11px] space-y-1 overflow-x-auto">
                <p className="text-indigo-400 font-bold">// Tesseract + LayoutLM OCR Extracted Key-Values</p>
                <pre>{JSON.stringify(selectedDocData.extractedData, null, 2)}</pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedDocData(null)} className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
