import React from 'react';
import { PathfinderLogo } from '../components/common/PathfinderLogo';
import {
  Code,
  CheckCircle,
  Video,
  Layers,
  Terminal,
  Cpu,
  ArrowRight,
  Shield,
  FileCheck,
} from 'lucide-react';

interface MethodologyPageProps {
  onNavigate: (view: string) => void;
}

export const MethodologyPage: React.FC<MethodologyPageProps> = ({ onNavigate }) => {
  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="bg-slate-50 border-b border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
            Educational Constitution
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0B2147]">
            The Pathfinder Learning Framework
          </h1>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            We reject passive video-watching. Every student at Pathfinder operates inside a rigorous production simulation combining code authorship, defect logging, and live architectural reviews.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 space-y-16">
        {/* Core Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Terminal className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Zero Toy Projects</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Students build distributed microservices and e-commerce platforms. No isolated tutorial snippets or toy calculators.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">AI-Augmented Engineering</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              We teach modern developers how to engineer with LLM APIs, Gemini SDK, and Cursor toolchains responsibly and securely.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <FileCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">ISTQB Quality Rigor</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Our manual testing curriculum adheres strictly to international ISTQB Foundation syllabi and standard Jira lifecycle protocols.
            </p>
          </div>
        </div>

        {/* Roadmap section */}
        <div className="bg-slate-50/70 rounded-3xl border border-slate-200 p-8 md:p-12 space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <h3 className="text-2xl font-extrabold text-[#0B2147]">The 5-Stage Evolution</h3>
            <p className="text-xs text-slate-500 mt-1">From enrollment to verified placement readiness</p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <span className="w-8 h-8 rounded-full bg-[#0B2147] text-white font-bold text-xs flex items-center justify-center shrink-0">1</span>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Orientation & Cryptographic Access Code Provisioning</h4>
                <p className="text-xs text-slate-500 mt-1">Students receive an invited credential and unique course access code tied to their learning profile.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="w-8 h-8 rounded-full bg-[#0B2147] text-white font-bold text-xs flex items-center justify-center shrink-0">2</span>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Synchronous & Asynchronous Hybrid Instruction</h4>
                <p className="text-xs text-slate-500 mt-1">High-definition modular video masterclasses supplemented by weekly live Google Meet / Zoom code review labs.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="w-8 h-8 rounded-full bg-[#0B2147] text-white font-bold text-xs flex items-center justify-center shrink-0">3</span>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Artifact Generation & Progress Telemetry</h4>
                <p className="text-xs text-slate-500 mt-1">Every completed lesson marks progress in the database; students author real test cases, bug reports, or API microservices.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="w-8 h-8 rounded-full bg-[#0B2147] text-white font-bold text-xs flex items-center justify-center shrink-0">4</span>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Capstone Defense & Faculty Review</h4>
                <p className="text-xs text-slate-500 mt-1">Students defend their full-stack applications or QA test execution summary reports before faculty leads.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="w-8 h-8 rounded-full bg-[#0B2147] text-white font-bold text-xs flex items-center justify-center shrink-0">5</span>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Corporate Hiring Referral Pipeline</h4>
                <p className="text-xs text-slate-500 mt-1">Direct interview loops with our network of over 120+ software product firms and testing consultancies.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-6 space-y-4">
          <button
            onClick={() => onNavigate('login')}
            className="px-8 py-3.5 bg-[#0B2147] hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm inline-flex items-center gap-2"
          >
            <span>Enter the Learning Portal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
