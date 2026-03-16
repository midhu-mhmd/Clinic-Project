import React from "react";
import { ShieldCheck, Activity, AlertTriangle } from "lucide-react";

const SystemLogs = () => {
  const logs = [
    { id: "LOG-882", event: "Node Auth", status: "success", detail: "Skyline Dental Verified", time: "14:22:01" },
    { id: "LOG-881", event: "API Drop", status: "error", detail: "Connection Timeout - Link 4", time: "14:18:45" },
    { id: "LOG-880", event: "Protocol Up", status: "success", detail: "Institutional Sync Complete", time: "14:15:12" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">System Logs</h1>
        <p className="text-sm text-zinc-500 mt-1">Real-time audit trail of platform operations.</p>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-12 bg-zinc-50/50 px-6 py-4 text-[10px] uppercase tracking-widest font-bold text-zinc-400 border-b border-zinc-100">
              <div className="col-span-2">Timestamp</div>
              <div className="col-span-3">Event Protocol</div>
              <div className="col-span-5">Technical Trace</div>
              <div className="col-span-2 text-right">Verification</div>
            </div>
            <div className="divide-y divide-zinc-50">
              {logs.map(log => (
                <div key={log.id} className="grid grid-cols-12 px-6 py-5 items-center hover:bg-zinc-50/50 transition-colors group">
                  <div className="col-span-2 text-[11px] font-mono text-zinc-400">{log.time}</div>
                  <div className="col-span-3">
                    <span className="text-xs font-semibold text-zinc-900 uppercase tracking-tight">{log.event}</span>
                    <p className="text-[10px] text-zinc-400 font-mono mt-0.5">#{log.id}</p>
                  </div>
                  <div className="col-span-5 text-sm text-zinc-600 font-medium">{log.detail}</div>
                  <div className="col-span-2 flex justify-end">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
                      log.status === 'success' 
                        ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                        : 'bg-red-50 border-red-100 text-red-600'
                    }`}>
                      {log.status === 'success' ? (
                        <>
                          <ShieldCheck size={12} />
                          <span className="text-[9px] font-bold uppercase tracking-wider">Verified</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={12} className="animate-pulse" />
                          <span className="text-[9px] font-bold uppercase tracking-wider">Failure</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemLogs;