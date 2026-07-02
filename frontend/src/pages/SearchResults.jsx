import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../services/api';
import { Search, Users, Briefcase, UserCog, Loader2 } from 'lucide-react';

const STATUS_COLORS = { Pending: 'bg-yellow-50 text-yellow-700 border-yellow-200', Active: 'bg-green-50 text-green-700 border-green-200', Closed: 'bg-slate-100 text-slate-600 border-slate-200', 'On Hold': 'bg-orange-50 text-orange-700 border-orange-200' };

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    API.get(`/search?q=${encodeURIComponent(q)}`).then(r => setResults(r.data.data)).catch(console.error).finally(() => setLoading(false));
  }, [q]);

  const total = results ? results.clients.length + results.cases.length + results.lawyers.length : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3"><Search className="h-8 w-8 text-primary" />Search Results</h1>
        {q && <p className="text-slate-500 mt-1">Showing results for <span className="font-semibold text-slate-700">"{q}"</span> {!loading && results && `— ${total} found`}</p>}
      </div>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-accent" /></div>
      ) : !results || total === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <Search className="h-12 w-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-800">No Results Found</h3>
          <p className="text-slate-500 text-sm mt-1">Try a different search term or check spelling.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {results.clients.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 bg-slate-50"><Users className="h-4.5 w-4.5 text-primary" /><h2 className="font-bold text-slate-800">Clients ({results.clients.length})</h2></div>
              <div className="divide-y divide-slate-100">
                {results.clients.map(c => (
                  <Link key={c.id} to={`/clients/${c.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 font-bold flex-shrink-0">{c.name[0]}</div>
                    <div><p className="font-semibold text-slate-900">{c.name}</p><p className="text-xs text-slate-400">{c.email} · {c.phone}</p></div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.cases.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 bg-slate-50"><Briefcase className="h-4.5 w-4.5 text-primary" /><h2 className="font-bold text-slate-800">Cases ({results.cases.length})</h2></div>
              <div className="divide-y divide-slate-100">
                {results.cases.map(c => (
                  <Link key={c.id} to={`/cases/${c.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 flex-shrink-0"><Briefcase className="h-4.5 w-4.5" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{c.case_title}</p>
                      <p className="text-xs text-slate-400 font-mono">{c.case_number}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex-shrink-0 ${STATUS_COLORS[c.status] || ''}`}>{c.status}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.lawyers.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-6 py-4 border-b border-slate-100 bg-slate-50"><UserCog className="h-4.5 w-4.5 text-primary" /><h2 className="font-bold text-slate-800">Lawyers ({results.lawyers.length})</h2></div>
              <div className="divide-y divide-slate-100">
                {results.lawyers.map(l => (
                  <Link key={l.id} to={`/lawyers/${l.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 font-bold flex-shrink-0">{l.name[0]}</div>
                    <div><p className="font-semibold text-slate-900">{l.name}</p><p className="text-xs text-slate-400">{l.email} · {l.specialization}</p></div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
