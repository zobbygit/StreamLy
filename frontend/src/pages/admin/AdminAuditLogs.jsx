import { useEffect, useState, useCallback } from "react";

import {
  ChevronLeft,
  ChevronRight,
  LogIn,
  Video,
  MessageSquarePlus,
  Ban,
  CheckCircle,
  Trash2,
  PhoneOff,
  Eye,
  Download,
  FileText,
} from "lucide-react";

import api from "../../lib/api";

// Maps raw action codes to a friendly label + icon
const ACTION_META = {
  USER_LOGIN: {
    label: "Logged in",
    icon: LogIn,
    color: "text-cyan bg-cyan/10",
  },
  CREATE_MEETING: {
    label: "Created a meeting",
    icon: Video,
    color: "text-electric-blue bg-electric-blue/10",
  },
  START_CONVERSATION: {
    label: "Started a chat",
    icon: MessageSquarePlus,
    color: "text-violet bg-violet/10",
  },
  END_MEETING: {
    label: "Ended a meeting",
    icon: PhoneOff,
    color: "text-red-400 bg-red-400/10",
  },
  ACTIVATE_USER: {
    label: "Activated a user",
    icon: CheckCircle,
    color: "text-green-400 bg-green-400/10",
  },
  DEACTIVATE_USER: {
    label: "Deactivated a user",
    icon: Ban,
    color: "text-yellow-400 bg-yellow-400/10",
  },
  DELETE_USER: {
    label: "Deleted a user",
    icon: Trash2,
    color: "text-red-400 bg-red-400/10",
  },
  VIEW_MEETING: {
    label: "Viewed a meeting",
    icon: Eye,
    color: "text-white/60 bg-white/10",
  },
};

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const { data } = await api.get("/admin/audit-logs", {
        params: {
          page,
          limit: 15,
        },
      });

      setLogs(data.logs);
      setTotalPages(data.totalPages);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  // -----------------------------
  // Export JSON
  // -----------------------------
  const handleExportJSON = () => {
    const exportLogs = logs.map((log) => ({
      id: log._id,
      actor: log.actorId?.name || "Deleted user",
      email: log.actorId?.email || "",
      action: log.action,
      actionLabel:
        ACTION_META[log.action]?.label || log.action,
      target: log.target || "",
      timestamp: log.createdAt || null,
    }));

    const blob = new Blob(
      [JSON.stringify(exportLogs, null, 2)],
      { type: "application/json" }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `audit-logs-${new Date()
      .toISOString()
      .split("T")[0]}.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // -----------------------------
  // Export PDF
  // -----------------------------
  const handleExportPDF = () => {
    if (!logs.length) return;

    const printWindow = window.open("", "_blank");

    if (!printWindow) return;

    const rows = logs
      .map((log) => {
        const meta =
          ACTION_META[log.action] || {
            label: log.action,
          };

        const actor = log.actorId?.name || "Deleted user";
        const email = log.actorId?.email || "—";
        const target = log.target || "—";
        const timestamp = log.createdAt
          ? new Date(log.createdAt).toLocaleString()
          : "—";

        return `
          <tr>
            <td>
              <strong>${meta.label}</strong>
              <div class="raw-action">${log.action}</div>
            </td>

            <td>
              <strong>${actor}</strong>
              <div class="secondary">${email}</div>
            </td>

            <td>
              <span class="target">${target}</span>
            </td>

            <td>
              ${timestamp}
            </td>
          </tr>
        `;
      })
      .join("");

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Admin Audit Logs</title>

          <style>
            * {
              box-sizing: border-box;
            }

            body {
              font-family: Arial, Helvetica, sans-serif;
              margin: 32px;
              color: #111827;
              background: white;
            }

            .header {
              margin-bottom: 24px;
            }

            h1 {
              margin: 0 0 6px;
              font-size: 24px;
              font-weight: 700;
            }

            .subtitle {
              margin: 0;
              color: #6b7280;
              font-size: 13px;
            }

            .info {
              margin-top: 8px;
              color: #9ca3af;
              font-size: 11px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }

            th {
              text-align: left;
              padding: 10px 12px;
              background: #f3f4f6;
              border-bottom: 2px solid #d1d5db;
              color: #4b5563;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }

            td {
              padding: 11px 12px;
              border-bottom: 1px solid #e5e7eb;
              font-size: 12px;
              vertical-align: top;
            }

            tr {
              page-break-inside: avoid;
            }

            .raw-action {
              margin-top: 3px;
              color: #9ca3af;
              font-size: 10px;
            }

            .secondary {
              margin-top: 3px;
              color: #9ca3af;
              font-size: 10px;
            }

            .target {
              font-family: monospace;
              font-size: 11px;
              color: #4b5563;
            }

            .footer {
              margin-top: 24px;
              font-size: 10px;
              color: #9ca3af;
            }

            @media print {
              body {
                margin: 16px;
              }

              @page {
                margin: 12mm;
              }
            }
          </style>
        </head>

        <body>
          <div class="header">
            <h1>Audit Logs</h1>

            <p class="subtitle">
              A record of important system and administrative activity
            </p>

            <div class="info">
              Exported on ${new Date().toLocaleString()} ·
              ${logs.length} records shown ·
              Page ${page} of ${totalPages}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Action</th>
                <th>Actor</th>
                <th>Target</th>
                <th>Timestamp</th>
              </tr>
            </thead>

            <tbody>
              ${rows}
            </tbody>
          </table>

          <div class="footer">
            Generated from the Admin Audit Logs page.
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500);
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">
            Audit Logs
          </h1>

          <p className="text-white/50 text-sm">
            A live record of important activity — logins, meetings created,
            chats started, and admin moderation actions.
          </p>
        </div>

        {/* Export buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExportJSON}
            disabled={loading || logs.length === 0}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 text-sm hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Download JSON"
          >
            <Download size={15} />
            JSON
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            disabled={loading || logs.length === 0}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 text-sm hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Download PDF"
          >
            <FileText size={15} />
            PDF
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-white/50 text-xs uppercase">
            <tr>
              <th className="text-left px-5 py-3 font-medium">
                Actor
              </th>

              <th className="text-left px-5 py-3 font-medium">
                Action
              </th>

              <th className="text-left px-5 py-3 font-medium">
                Target
              </th>

              <th className="text-left px-5 py-3 font-medium">
                Timestamp
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center text-white/40 py-8"
                >
                  Loading...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="text-center text-white/40 py-8"
                >
                  No activity yet. Logins, meeting creation, and chat
                  starts will appear here as they happen.
                </td>
              </tr>
            ) : (
              logs.map((log) => {
                const meta = ACTION_META[log.action] || {
                  label: log.action,
                  icon: Eye,
                  color: "text-white/60 bg-white/10",
                };

                const Icon = meta.icon;

                return (
                  <tr
                    key={log._id}
                    className="text-white/80 hover:bg-white/[0.03]"
                  >
                    <td className="px-5 py-3">
                      <div className="flex flex-col">
                        <span>
                          {log.actorId?.name || "Deleted user"}
                        </span>

                        <span className="text-xs text-white/40">
                          {log.actorId?.email || "—"}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${meta.color}`}
                      >
                        <Icon size={12} />
                        {meta.label}
                      </span>
                    </td>

                    <td className="px-5 py-3 font-mono text-xs">
                      {log.target || "—"}
                    </td>

                    <td className="px-5 py-3 text-white/50">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <p className="text-xs text-white/40">
          Page {page} of {totalPages}
        </p>

        <div className="flex items-center gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="p-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-30"
          >
            <ChevronLeft size={14} className="text-white" />
          </button>

          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="p-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-30"
          >
            <ChevronRight size={14} className="text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}