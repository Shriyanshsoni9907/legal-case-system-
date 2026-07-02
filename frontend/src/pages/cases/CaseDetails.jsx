import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import caseService from '../../services/caseService';
import documentService from '../../services/documentService';
import hearingService from '../../services/hearingService';
import { useAuth } from '../../context/AuthContext';
import CaseForm from './CaseForm';
import { ArrowLeft, Edit3, Trash2, Loader2, AlertCircle, Briefcase, FileText, Calendar, Upload, Download, X, Plus, Building2, User2, Gavel } from 'lucide-react';

const STATUS_COLORS = { Pending: 'bg-yellow-50 text-yellow-700 border-yellow-200', Active: 'bg-green-50 text-green-700 border-green-200', Closed: 'bg-slate-100 text-slate-600 border-slate-200', 'On Hold': 'bg-orange-50 text-orange-700 border-orange-200' };

const CaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [caseData, setCaseData] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [hearings, setHearings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const isAdmin = user?.role === 'Admin';

  const fetchAll = async () => {
    setLoading(true); setError(null);
    try {
      const [caseRes, docsRes, hearingsRes] = await Promise.all([
        caseService.getCase(id),
        documentService.getDocuments(id),
        hearingService.getHearings(id),
      ]);
      setCaseData(caseRes.data.case);
      setDocuments(docsRes.data.documents);
      setHearings(hearingsRes.data.hearings);
    } catch (err) { setError('Could not load case details.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [id]);

  const handleDelete = async () => {
    if (window.confirm(`Delete case "${caseData.case_title}"?`)) {
      try { await caseService.deleteCase(id); navigate('/cases'); }
      catch (err) { alert(err.response?.data?.message || 'Delete failed.'); }
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      await documentService.uploadDocument(id, file);
      const docsRes = await documentService.getDocuments(id);
      setDocuments(docsRes.data.documents);
    } catch (err) { alert(err.response?.data?.message || 'Upload failed.'); }
    finally { setUploading(false); if (fileInputRef.current) fileInputRef.current.value = ''; }
  };

  const handleDocDelete = async (docId) => {
    if (window.confirm('Delete this document?')) {
      try { await documentService.deleteDocument(id, docId); setDocuments(d => d.filter(doc => doc.id !== docId)); }
      catch (err) { alert('Delete failed.'); }
    }
  };

  const formatFileSize = (bytes) => bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${(bytes/1024).toFixed(1)} KB` : `${(bytes/1048576).toFixed(1)} MB`;

  if (loading) return <div className="flex min-h-[50vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-accent" /></div>;
  if (error || !caseData) return <div className="space-y-4"><button onClick={() => navigate('/cases')} className="flex items-center gap-2 text-sm text-slate-600"><ArrowLeft className="h-4 w-4" />Back to Cases</button><div className="flex items-center gap-3 p-6 rounded-2xl bg-red-50 border border-red-100 text-red-700"><AlertCircle className="h-6 w-6" /><p className="text-sm">{error}</p></div></div>;

  const tabs = [{ id: 'overview', label: 'Overview', icon: Briefcase }, { id: 'documents', label: `Documents (${documents.length})`, icon: FileText }, { id: 'hearings', label: `Hearings (${hearings.length})`, icon: Calendar }];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button onClick={() => navigate('/cases')} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-950 font-medium"><ArrowLeft className="h-4 w-4" />Back to Cases</button>
        <div className="flex items-center gap-2.5">
          <button onClick={() => setFormOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-sm"><Edit3 className="h-4 w-4" />Edit</button>
          {isAdmin && <button onClick={handleDelete} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-sm font-semibold border border-red-200"><Trash2 className="h-4 w-4" />Delete</button>}
        </div>
      </div>

      {/* Case Header Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{caseData.case_title}</h1>
            <p className="text-sm font-mono text-slate-400 mt-1">{caseData.case_number}</p>
          </div>
          <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-semibold border ${STATUS_COLORS[caseData.status] || ''}`}>{caseData.status}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {[
            { icon: Briefcase, label: 'Type', value: caseData.case_type },
            { icon: Building2, label: 'Court', value: caseData.court },
            { icon: User2, label: 'Client', value: caseData.client_name || '—' },
            { icon: Gavel, label: 'Lawyer', value: caseData.lawyer_name || 'Unassigned' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-slate-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1"><Icon className="h-3.5 w-3.5" />{label}</div>
              <p className="font-semibold text-slate-800">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-colors ${activeTab === tab.id ? 'border-b-2 border-accent text-accent' : 'text-slate-500 hover:text-slate-800'}`}>
              <tab.icon className="h-4 w-4" />{tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Filing & Hearing Dates</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-slate-50 rounded-xl p-4"><p className="text-xs text-slate-400 font-semibold uppercase mb-1">Filing Date</p><p className="font-semibold text-slate-800">{caseData.filing_date ? new Date(caseData.filing_date).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' }) : '—'}</p></div>
                  <div className="bg-slate-50 rounded-xl p-4"><p className="text-xs text-slate-400 font-semibold uppercase mb-1">Next Hearing</p><p className="font-semibold text-slate-800">{caseData.hearing_date ? new Date(caseData.hearing_date).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' }) : '—'}</p></div>
                </div>
              </div>
              {caseData.description && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Case Description</h3>
                  <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{caseData.description}</div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">Case Documents</h3>
                <div>
                  <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload}
                    accept=".pdf,.doc,.docx,image/*" />
                  <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-semibold shadow-md shadow-accent/15 disabled:opacity-75">
                    <Upload className="h-4 w-4" />{uploading ? 'Uploading...' : 'Upload File'}
                  </button>
                </div>
              </div>

              {documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-10 border border-dashed border-slate-200 rounded-xl text-center">
                  <FileText className="h-10 w-10 text-slate-300 mb-3" />
                  <p className="text-sm font-semibold text-slate-600">No documents uploaded yet</p>
                  <p className="text-xs text-slate-400 mt-1">Supported: PDF, DOC, DOCX, Images (max 10MB)</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary flex-shrink-0"><FileText className="h-4.5 w-4.5" /></div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{doc.file_name}</p>
                          <p className="text-xs text-slate-400">{formatFileSize(doc.file_size)} · Uploaded by {doc.uploader_name} · {new Date(doc.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                        <a href={`http://localhost:5000/uploads/${doc.file_path}`} download={doc.file_name} target="_blank" rel="noreferrer"
                          className="p-2 text-slate-500 hover:text-accent hover:bg-slate-100 rounded-lg transition-colors"><Download className="h-4 w-4" /></a>
                        <button onClick={() => handleDocDelete(doc.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><X className="h-4 w-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'hearings' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-700">Scheduled Hearings</h3>
              {hearings.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-10 border border-dashed border-slate-200 rounded-xl text-center">
                  <Calendar className="h-10 w-10 text-slate-300 mb-3" />
                  <p className="text-sm font-semibold text-slate-600">No hearings scheduled</p>
                  <p className="text-xs text-slate-400 mt-1">Use the Hearing Calendar to schedule hearings for this case.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {hearings.map(h => (
                    <div key={h.id} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex-shrink-0 bg-primary/10 text-primary rounded-xl p-3"><Calendar className="h-5 w-5" /></div>
                      <div>
                        <p className="font-semibold text-slate-800">{new Date(h.hearing_date).toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</p>
                        <p className="text-sm text-slate-500 mt-0.5">Court: <span className="font-medium text-slate-700">{h.court}</span> · Judge: <span className="font-medium text-slate-700">{h.judge}</span></p>
                        {h.description && <p className="text-sm text-slate-500 mt-1">{h.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <CaseForm isOpen={formOpen} onClose={() => setFormOpen(false)} onSuccess={fetchAll} caseData={caseData} />
    </div>
  );
};

export default CaseDetails;
