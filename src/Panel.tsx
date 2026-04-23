/**
 * Event Inspector Panel - React Component
 *
 * Controlled component - receives events and callbacks from parent.
 */

import { useState, useCallback } from "react";
import type { EventRecord } from "./event-capture";

export interface PanelProps {
  events: EventRecord[];
  onClear: () => void;
  onPauseToggle: () => void;
  onEventClick: (record: EventRecord) => void;
}

const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export function Panel({
  events,
  onClear,
  onPauseToggle,
  onEventClick,
}: PanelProps) {
  const [minimized, setMinimized] = useState(false);

  const handleMinimize = useCallback(() => {
    setMinimized((prev) => !prev);
  }, []);

  return (
    <div style={styles.host}>
      <style>{`
        .panel-event-item:hover { background: #3d3d3d !important; }
      `}</style>
      <div style={styles.panel}>
        <div style={styles.header}>
          <h3 style={styles.title}>Event Inspector</h3>
          <div style={styles.actions}>
            <button style={styles.btn} onClick={onClear}>
              Clear
            </button>
            <button style={styles.btnPause} onClick={onPauseToggle}>
              Pause
            </button>
            <button style={styles.btn} onClick={handleMinimize}>
              _
            </button>
          </div>
        </div>
        {!minimized && (
          <div style={styles.eventList}>
            {events.map((record) => (
              <div
                key={record.id}
                className="panel-event-item"
                style={styles.eventItem}
                onClick={() => onEventClick(record)}
              >
                <div style={styles.eventRow}>
                  <span
                    style={
                      record.eventType === "custom"
                        ? styles.badgeCustom
                        : styles.badgeNative
                    }
                  >
                    {record.eventType}
                  </span>
                  <span style={styles.eventName}>{record.name}</span>
                  <span style={styles.eventTarget}>{record.target}</span>
                  <span style={styles.eventTime}>
                    {formatTime(record.timestamp)}
                  </span>
                </div>
                {record.eventType === "custom" &&
                  record.detail !== undefined && (
                    <div style={styles.detailJson}>
                      {JSON.stringify(record.detail, null, 2)}
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  host: {
    position: "fixed",
    top: "20px",
    right: "20px",
    width: "380px",
    maxHeight: "400px",
    zIndex: "2147483647",
    fontFamily: "system-ui, sans-serif",
    fontSize: "13px",
  },
  panel: {
    background: "#1e1e1e",
    color: "#fff",
    borderRadius: "8px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    maxHeight: "400px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 12px",
    borderBottom: "1px solid #444",
    flexShrink: 0,
  },
  title: {
    margin: 0,
    fontSize: "14px",
    fontWeight: 600,
  },
  actions: {
    display: "flex",
    gap: "6px",
  },
  btn: {
    background: "#444",
    border: "none",
    color: "#fff",
    padding: "4px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
  btnPause: {
    background: "#FF9800",
    border: "none",
    color: "#fff",
    padding: "4px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
  eventList: {
    maxHeight: "320px",
    overflowY: "auto",
    padding: "8px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  eventItem: {
    padding: "6px 8px",
    marginBottom: "4px",
    borderRadius: "4px",
    background: "#2d2d2d",
    cursor: "pointer",
  },
  eventRow: {
    display: "flex",
    alignItems: "center",
  },
  badgeNative: {
    background: "#4CAF50",
    color: "#fff",
    padding: "2px 6px",
    borderRadius: "3px",
    fontSize: "10px",
    marginRight: "6px",
  },
  badgeCustom: {
    background: "#2196F3",
    color: "#fff",
    padding: "2px 6px",
    borderRadius: "3px",
    fontSize: "10px",
    marginRight: "6px",
  },
  eventName: {
    fontWeight: 600,
  },
  eventTarget: {
    color: "#aaa",
    fontSize: "11px",
    marginLeft: "8px",
  },
  eventTime: {
    color: "#666",
    fontSize: "10px",
    marginLeft: "auto",
  },
  detailJson: {
    marginTop: "4px",
    padding: "4px",
    background: "#222",
    borderRadius: "3px",
    fontSize: "11px",
    color: "#88ff88",
    fontFamily: "monospace",
    whiteSpace: "pre-wrap",
    wordBreak: "break-all",
  },
};
