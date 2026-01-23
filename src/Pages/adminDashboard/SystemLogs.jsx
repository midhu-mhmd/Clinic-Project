import React from "react";
import { ShieldCheck, Activity, AlertTriangle } from "lucide-react";

const SystemLogs = () => {
  const logs = [
    { id: "LOG-882", event: "Node Auth", status: "success", detail: "Skyline Dental Verified", time: "14:22:01" },
    { id: "LOG-881", event: "API Drop", status: "error", detail: "Connection Timeout - Link 4", time: "14:18:45" },
    { id: "LOG-880", event: "Protocol Up", status: "success", detail: "Institutional Sync Complete", time: "14:15:12" },
  ];

  return (
    <div className="bg-white border border-[#2D302D]/5 rounded-sm overflow-hidden">
      <div className="grid grid-cols-12 bg-[#2D302D]/5 p-6 text-[9px] uppercase tracking-widest font-bold opacity-40">
        <div className="col-span-2">Timestamp</div>
        <div className="col-span-3">Protocol</div>
        <div className="col-span-5">Technical Detail</div>
        <div className="col-span-2 text-right">Status</div>
      </div>
      <div className="divide-y divide-[#2D302D]/5">
        {logs.map(log => (
          <div key={log.id} className="grid grid-cols-12 p-8 items-center hover:bg-[#FAF9F6] transition-colors group">
            <div className="col-span-2 text-[10px] font-mono opacity-40">{log.time}</div>
            <div className="col-span-3 text-xs font-bold uppercase tracking-tight">{log.event}</div>
            <div className="col-span-5 text-sm font-light text-[#2D302D]/60">{log.detail}</div>
            <div className="col-span-2 flex justify-end">
              {log.status === 'success' ? <ShieldCheck size={18} className="text-[#8DAA9D]" /> : <AlertTriangle size={18} className="text-red-400 animate-pulse" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemLogs;