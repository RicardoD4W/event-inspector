/**
 * Event Inspector Panel - Presentation Layer
 *
 * React component for the Event Inspector panel.
 */

import { useState, useCallback } from "react";
import type { EventRecord } from "../../domain/entities/EventRecord";

export interface PanelProps {
  events: EventRecord[];
  onClear: () => void;
  onPauseToggle: () => void;
  onEventClick?: (record: EventRecord) => void;
  paused?: boolean;
}

const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export function Panel(props: PanelProps) {
  const { events, onClear, onPauseToggle, paused = false } = props;

  const nativeEvents = events.filter((e) => e.eventType === "native");
  const customEvents = events.filter((e) => e.eventType === "custom");

  const [minimized, setMinimized] = useState(false);
  const [nativeCollapsed, setNativeCollapsed] = useState(true);
  const [customCollapsed, setCustomCollapsed] = useState(true);

  const handleMinimize = useCallback(() => {
    setMinimized((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    window.dispatchEvent(new CustomEvent("event-inspector-close"));
  }, []);

  const handleToggleCapture = useCallback(() => {
    onPauseToggle();
  }, [onPauseToggle]);

  return (
    <div style={styles.host}>
      <div style={styles.panel}>
        <div style={styles.header}>
          <h3 style={styles.title}>Event Inspector</h3>
          <div style={styles.actions}>
            <button style={styles.btn} onClick={onClear}>
              Clear
            </button>
            <button
              style={paused ? styles.btnOff : styles.btnOn}
              onClick={handleToggleCapture}
            >
              {paused ? "Off" : "On"}
            </button>
            <button style={styles.btn} onClick={handleMinimize}>
              _
            </button>
            <button
              id="event-inspector-close-btn"
              style={styles.btnClose}
              onClick={handleClose}
            >
              ×
            </button>
          </div>
        </div>

        {!minimized && (
          <div style={styles.eventList}>
            {/* Native Group */}
            <div style={styles.group}>
              <div
                style={styles.groupHeader}
                onClick={() => setNativeCollapsed(!nativeCollapsed)}
              >
                <span style={styles.collapseIcon}>
                  {nativeCollapsed ? "▶" : "▼"}
                </span>
                <span style={styles.badgeNative}>Native</span>
                <span style={styles.groupCount}>{nativeEvents.length}</span>
              </div>
              {!nativeCollapsed && nativeEvents.length > 0 && (
                <div style={styles.groupEvents}>
                  {nativeEvents.slice(0, 30).map((event) => (
                    <div
                      key={event.id}
                      style={{ ...styles.eventItem, paddingLeft: "28px" }}
                    >
                      <span style={styles.eventName}>{event.name}</span>
                      <span style={styles.eventTarget}>{event.target}</span>
                      <span style={styles.eventTime}>
                        {formatTime(event.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Custom Group */}
            <div style={styles.group}>
              <div
                style={styles.groupHeader}
                onClick={() => setCustomCollapsed(!customCollapsed)}
              >
                <span style={styles.collapseIcon}>
                  {customCollapsed ? "▶" : "▼"}
                </span>
                <span style={styles.badgeCustom}>Custom</span>
                <span style={styles.groupCount}>{customEvents.length}</span>
              </div>
              {!customCollapsed && customEvents.length > 0 && (
                <div style={styles.groupEvents}>
                  {customEvents.slice(0, 30).map((event) => (
                    <div
                      key={event.id}
                      style={{ ...styles.eventItem, paddingLeft: "28px" }}
                    >
                      <span style={styles.eventName}>{event.name}</span>
                      <span style={styles.eventTarget}>{event.target}</span>
                      <span style={styles.eventTime}>
                        {formatTime(event.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
    pointerEvents: "auto",
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
  btnClose: {
    background: "#f44336",
    border: "none",
    color: "#fff",
    padding: "4px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
  },
  btnOn: {
    background: "#4CAF50",
    border: "none",
    color: "#fff",
    padding: "4px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
  btnOff: {
    background: "#f44336",
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
  group: {
    marginBottom: "8px",
  },
  groupHeader: {
    display: "flex",
    alignItems: "center",
    padding: "6px 8px",
    background: "#2d2d2d",
    borderRadius: "4px",
    cursor: "pointer",
    userSelect: "none",
  },
  collapseIcon: {
    fontSize: "10px",
    marginRight: "6px",
    color: "#888",
  },
  groupCount: {
    marginLeft: "auto",
    fontSize: "11px",
    color: "#888",
  },
  groupEvents: {
    marginTop: "4px",
    display: "flex",
    flexDirection: "column",
  },
  eventItem: {
    padding: "6px 8px",
    marginBottom: "4px",
    borderRadius: "4px",
    background: "#2d2d2d",
    cursor: "pointer",
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
    flexShrink: 0,
  },
  eventTarget: {
    color: "#aaa",
    fontSize: "11px",
    marginLeft: "8px",
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  eventTime: {
    color: "#666",
    fontSize: "10px",
    marginLeft: "auto",
    flexShrink: 0,
  },
};
