import React, { useState } from 'react';
import { Database, Copy, Check, ExternalLink, X, ShieldCheck, Terminal, Server } from 'lucide-react';
import { isSupabaseConfigured, SUPABASE_SQL_SCHEMA, testSupabaseConnection } from '../../services/supabase';
import { useToast } from './Toast';

interface ConnectSupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectSupabaseModal: React.FC<ConnectSupabaseModalProps> = ({ isOpen, onClose }) => {
  const { success, error } = useToast();
  const [copied, setCopied] = useState(false);
  const [testUrl, setTestUrl] = useState('');
  const [testKey, setTestKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleCopySchema = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    success('PostgreSQL Schema SQL copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection(testUrl || undefined, testKey || undefined);
      setTestResult(res);
      if (res.success) {
        success(res.message);
      } else {
        error(res.message);
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err?.message || 'Connection test failed' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Supabase Backend & PostgreSQL Setup</h2>
              <p className="text-xs text-slate-500">Configure cloud persistence and execute database schema</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-600">
          {/* Status banner */}
          <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
            isSupabaseConfigured
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              : 'bg-amber-50/70 border-amber-200 text-amber-900'
          }`}>
            <Server className={`w-5 h-5 shrink-0 mt-0.5 ${isSupabaseConfigured ? 'text-emerald-700' : 'text-amber-700'}`} />
            <div>
              <div className="font-semibold text-sm">
                {isSupabaseConfigured
                  ? 'Connected to Live Supabase Backend'
                  : 'Operating in Built-in Full-Stack Persistent Mode'}
              </div>
              <p className="text-xs mt-1 leading-relaxed opacity-90">
                {isSupabaseConfigured
                  ? 'Your environment variables are recognized and connected to your cloud Supabase database.'
                  : 'All student enrollments, course content, access codes, and progress are currently stored in the real client persistent engine. Connect your Supabase instance below for multi-user cloud synchronization.'}
              </p>
            </div>
          </div>

          {/* Quick Setup Steps */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              3-Step Supabase Provisioning Guide
            </h3>
            <ol className="space-y-3 text-xs leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0">1</span>
                <div>
                  Create a free project at{' '}
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    supabase.com <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0">2</span>
                <div>
                  Navigate to <strong>SQL Editor &gt; New Query</strong>, paste the complete DDL script below, and click <strong>Run</strong>.
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0">3</span>
                <div>
                  Add your credentials to <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono">.env</code>:
                  <div className="mt-1.5 bg-slate-900 text-slate-100 p-2.5 rounded-lg font-mono text-[11px] select-all space-y-1">
                    <div>VITE_SUPABASE_URL="https://[YOUR-PROJECT].supabase.co"</div>
                    <div>VITE_SUPABASE_ANON_KEY="eyJhbGci..."</div>
                  </div>
                </div>
              </li>
            </ol>
          </div>

          {/* SQL Schema Copy Box */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-slate-500" /> PostgreSQL DDL Migration Script
              </span>
              <button
                onClick={handleCopySchema}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied SQL!' : 'Copy SQL Schema'}
              </button>
            </div>
            <div className="bg-slate-900 rounded-xl p-3 max-h-48 overflow-y-auto text-slate-200 font-mono text-xs border border-slate-800">
              <pre className="whitespace-pre-wrap">{SUPABASE_SQL_SCHEMA}</pre>
            </div>
          </div>

          {/* Test Connection Form */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Test Supabase Endpoint
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Project URL (optional override)</label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={testUrl}
                  onChange={(e) => setTestUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Anon Public Key</label>
                <input
                  type="password"
                  placeholder="eyJhbGciOi..."
                  value={testKey}
                  onChange={(e) => setTestKey(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {testResult.success ? <ShieldCheck className="w-4 h-4" /> : <X className="w-4 h-4" />}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Pathfinder LMS • Full PostgreSQL Support
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleTestConnection}
              disabled={testing}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              {testing ? 'Pinging Database...' : 'Test Connection'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
