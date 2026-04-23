/**
 * Event Inspector Panel - Presentation Layer
 *
 * React component for the Event Inspector panel.
 * Supports main view and expanded detail view.
 */

import { useState, useCallback, useEffect } from "react";
import type { EventRecord } from "../../domain/entities/EventRecord";
import { getCssSelector } from "../../infrastructure/css-selector/CssSelector";

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

// ─────────────────────────────────────────────────────────────────────────────
// VirtualScroll Component - Efficient rendering for long lists
// ─────────────────────────────────────────────────────────────────────────────

interface VirtualScrollProps {
  items: Element[];
  itemHeight: number;
  renderItem: (el: Element, index: number) => React.ReactNode;
}

function VirtualScroll({ items, itemHeight, renderItem }: VirtualScrollProps) {
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    // Set fixed height for scroll container
    if (node) {
      node.style.overflowY = "auto";
      node.style.maxHeight = "300px";
    }
  }, []);

  if (!items.length) {
    return <div style={styles.treeEmpty}>No path available</div>;
  }

  return (
    <div ref={containerRef} style={styles.virtualScrollContainer}>
      <div style={{ height: items.length * itemHeight, position: "relative" }}>
        {items.map((el, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: i * itemHeight,
              left: 0,
              right: 0,
              height: itemHeight,
            }}
          >
            {renderItem(el, i)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DomTree Component - Renders the event propagation path with virtual scroll
// ─────────────────────────────────────────────────────────────────────────────

function DomTree({ path }: { path: Element[] }) {
  if (!path || path.length === 0) {
    return <div style={styles.treeEmpty}>No path available</div>;
  }

  // Reverse to show target first → root
  const reversedPath = [...path].reverse();
  const ITEM_HEIGHT = 24;

  const renderNode = (el: Element, i: number) => {
    const selector = getCssSelector(el);
    const target = i === 0;
    const depth = i;

    return (
      <div
        style={{
          ...styles.treeNode,
          paddingLeft: `${depth * 16 + 8}px`,
          height: ITEM_HEIGHT,
          display: "flex",
          alignItems: "center",
        }}
      >
        <span style={styles.treeArrow}>├── </span>
        <span
          style={{
            ...styles.treeSelector,
            ...(target ? styles.treeSelectorTarget : {}),
          }}
        >
          {selector}
        </span>
        {target && <span style={styles.targetBadge}>TARGET</span>}
      </div>
    );
  };

  return (
    <div style={styles.domTree}>
      <VirtualScroll items={reversedPath} itemHeight={ITEM_HEIGHT} renderItem={renderNode} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EventDetailView Component - Expanded detail with DOM tree
// ─────────────────────────────────────────────────────────────────────────────

interface EventDetailViewProps {
  event: EventRecord;
  onBack: () => void;
  onTargetClick: (element: Element) => void;
  isExiting?: boolean;
}

function EventDetailView({ event, onBack, onTargetClick, isExiting }: EventDetailViewProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isExiting) {
      setVisible(false);
    } else {
      // Delay content visibility for smooth animation
      const timer = setTimeout(() => setVisible(true), 50);
      return () => clearTimeout(timer);
    }
  }, [isExiting]);

  const handleTargetClick = useCallback(() => {
    onTargetClick(event.targetElement);
  }, [onTargetClick, event.targetElement]);

  return (
    <div
      style={{
        ...styles.detailView,
        ...(visible ? styles.detailViewVisible : {}),
        ...(isExiting ? styles.detailViewExiting : {}),
      }}
    >
      {/* Header with back button */}
      <div style={styles.detailHeader}>
        <button style={styles.backBtn} onClick={onBack}>
          ← Back
        </button>
      </div>

      {/* Event summary - clickable to highlight target */}
      <div style={styles.eventSummary} onClick={handleTargetClick}>
        <span
          style={{
            ...(event.eventType === "native"
              ? styles.badgeNative
              : styles.badgeCustom),
            cursor: "pointer",
          }}
        >
          {event.eventType}
        </span>
        <span style={styles.detailEventName}>{event.name}</span>
        <span style={styles.highlightHint}>👆 click to highlight</span>
      </div>

      {/* Metadata */}
      <div style={styles.eventMeta}>
        <div style={styles.metaRow}>
          <span style={styles.metaLabel}>Target:</span>
          <code style={styles.metaCode}>{event.target}</code>
        </div>
        <div style={styles.metaRow}>
          <span style={styles.metaLabel}>Time:</span>
          <span style={styles.metaValue}>{formatTime(event.timestamp)}</span>
        </div>
        {event.bubbles !== undefined && (
          <div style={styles.metaRow}>
            <span style={styles.metaLabel}>Bubbles:</span>
            <span style={styles.metaValue}>{event.bubbles ? "Yes" : "No"}</span>
          </div>
        )}
        {event.detail !== undefined && (
          <div style={styles.metaRow}>
            <span style={styles.metaLabel}>Detail:</span>
            <code style={styles.metaCode}>
              {JSON.stringify(event.detail, null, 2)}
            </code>
          </div>
        )}
      </div>

      {/* DOM Tree */}
      <div style={styles.treeSection}>
        <h4 style={styles.treeTitle}>Event Path (DOM Tree)</h4>
        <DomTree path={event.composedPath || []} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Panel Component
// ─────────────────────────────────────────────────────────────────────────────

export function Panel(props: PanelProps) {
  const { events, onClear, onPauseToggle, paused = false } = props;

  const nativeEvents = events.filter((e) => e.eventType === "native");
  const customEvents = events.filter((e) => e.eventType === "custom");

  const [minimized, setMinimized] = useState(false);
  const [nativeCollapsed, setNativeCollapsed] = useState(true);
  const [customCollapsed, setCustomCollapsed] = useState(true);

  // Detail view state
  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const handleMinimize = useCallback(() => {
    setMinimized((prev) => !prev);
  }, []);

  const handleClose = useCallback(() => {
    window.dispatchEvent(new CustomEvent("event-inspector-close"));
  }, []);

  const handleToggleCapture = useCallback(() => {
    onPauseToggle();
  }, [onPauseToggle]);

  const handleEventClick = useCallback((event: EventRecord) => {
    setSelectedEvent(event);
    setIsExpanded(true);
  }, []);

  const handleBack = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      setIsExpanded(false);
      setIsExiting(false);
      setSelectedEvent(null);
    }, 250);
  }, []);

  const handleTargetClick = useCallback((element: Element) => {
    if (!element || !element.isConnected) return;

    const el = element as HTMLElement;

    // Scroll into view
    el.scrollIntoView({ behavior: "smooth", block: "center" });

    // Ripple outline animation - shrinks from outside to element size
    const rect = el.getBoundingClientRect();
    const startScale = 1.5; // Start 50% larger than element

    const ripple = document.createElement("div");
    ripple.style.cssText = `
      position: fixed;
      left: ${rect.left - (rect.width * (startScale - 1)) / 2}px;
      top: ${rect.top - (rect.height * (startScale - 1)) / 2}px;
      width: ${rect.width * startScale}px;
      height: ${rect.height * startScale}px;
      border: 3px solid #FF9800;
      border-radius: 8px;
      pointer-events: none;
      z-index: 2147483646;
      transform-origin: center;
    `;
    document.body.appendChild(ripple);

    const startTime = performance.now();
    const duration = 500;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      // Scale from startScale down to 1
      const scale = startScale - (startScale - 1) * eased;
      const currentWidth = rect.width * scale;
      const currentHeight = rect.height * scale;

      ripple.style.width = `${currentWidth}px`;
      ripple.style.height = `${currentHeight}px`;
      ripple.style.left = `${rect.left - (currentWidth - rect.width) / 2}px`;
      ripple.style.top = `${rect.top - (currentHeight - rect.height) / 2}px`;

      // Fade out in the last 30%
      ripple.style.opacity = progress > 0.7 ? String(1 - (progress - 0.7) / 0.3) : "1";

      // Final snap to element outline
      if (progress >= 1) {
        ripple.style.width = `${rect.width}px`;
        ripple.style.height = `${rect.height}px`;
        ripple.style.left = `${rect.left}px`;
        ripple.style.top = `${rect.top}px`;
        ripple.style.opacity = "0";
        ripple.style.transition = "opacity 0.3s ease-out";
        setTimeout(() => ripple.remove(), 300);
        return;
      }

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, []);

  return (
    <div
      style={{
        ...styles.host,
        ...(isExpanded ? styles.hostExpanded : {}),
      }}
    >
      <div
        style={{
          ...styles.panel,
          ...(isExpanded ? styles.panelExpanded : {}),
        }}
      >
        {/* Header - always visible */}
        <div style={styles.header}>
          <h3 style={styles.title}>
            {isExpanded ? "Event Detail" : "Event Inspector"}
          </h3>
          <div style={styles.actions}>
            {!isExpanded && (
              <button style={styles.btn} onClick={onClear}>
                Clear
              </button>
            )}
            <button
              style={paused ? styles.btnOff : styles.btnOn}
              onClick={handleToggleCapture}
            >
              {paused ? "Off" : "On"}
            </button>
            {!isExpanded && !isExiting && (
              <button style={styles.btn} onClick={handleMinimize}>
                _
              </button>
            )}
            <button style={styles.btnClose} onClick={handleClose}>
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        {!isExpanded ? (
          // ─────────────────────────────────────────────────────────────────
          // Main List View
          // ─────────────────────────────────────────────────────────────────
          !minimized && (
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
                        onClick={() => handleEventClick(event)}
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
                        onClick={() => handleEventClick(event)}
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
          )
        ) : selectedEvent ? (
          // ─────────────────────────────────────────────────────────────────
          // Detail View
          // ─────────────────────────────────────────────────────────────────
          <EventDetailView event={selectedEvent} onBack={handleBack} onTargetClick={handleTargetClick} isExiting={isExiting} />
        ) : null}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

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
    transition: "width 0.3s ease-out",
  },
  hostExpanded: {
    width: "420px",
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
    transition: "max-height 0.3s ease-out",
  },
  panelExpanded: {
    maxHeight: "600px",
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

  // ─────────────────────────────────────────────────────────────────────────
  // Detail View Styles
  // ─────────────────────────────────────────────────────────────────────────
  detailView: {
    padding: "12px",
    opacity: 0,
    transform: "translateY(-8px)",
    transition: "opacity 0.25s ease-out, transform 0.25s ease-out",
    maxHeight: "520px",
    overflowY: "auto",
  },
  detailViewVisible: {
    opacity: 1,
    transform: "translateY(0)",
  },
  detailViewExiting: {
    opacity: 0,
    transform: "translateY(-8px)",
    transition: "opacity 0.2s ease-out, transform 0.2s ease-out",
  },
  detailHeader: {
    marginBottom: "12px",
  },
  backBtn: {
    background: "#2196F3",
    border: "none",
    color: "#fff",
    padding: "6px 12px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
  eventSummary: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px",
    padding: "8px",
    background: "#2d2d2d",
    borderRadius: "4px",
    cursor: "pointer",
  },
  highlightHint: {
    marginLeft: "auto",
    fontSize: "10px",
    color: "#666",
  },
  detailEventName: {
    fontSize: "16px",
    fontWeight: 600,
  },
  eventMeta: {
    marginBottom: "16px",
  },
  metaRow: {
    display: "flex",
    alignItems: "flex-start",
    marginBottom: "8px",
    fontSize: "12px",
  },
  metaLabel: {
    color: "#888",
    minWidth: "60px",
  },
  metaValue: {
    color: "#ccc",
  },
  metaCode: {
    fontFamily: "monospace",
    fontSize: "11px",
    color: "#ccc",
    background: "#333",
    padding: "2px 6px",
    borderRadius: "3px",
    wordBreak: "break-all",
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DOM Tree Styles
  // ─────────────────────────────────────────────────────────────────────────
  treeSection: {
    borderTop: "1px solid #444",
    paddingTop: "12px",
  },
  treeTitle: {
    margin: "0 0 8px 0",
    fontSize: "12px",
    fontWeight: 600,
    color: "#888",
    textTransform: "uppercase",
  },
  domTree: {
    fontFamily: "monospace",
    fontSize: "11px",
    lineHeight: "1.6",
  },
  virtualScrollContainer: {
    overflowY: "auto",
    maxHeight: "300px",
  },
  treeEmpty: {
    color: "#666",
    fontStyle: "italic",
    padding: "8px",
  },
  treeNode: {
    display: "flex",
    alignItems: "center",
    padding: "2px 0",
  },
  treeArrow: {
    color: "#555",
    userSelect: "none",
  },
  treeSelector: {
    color: "#aaa",
  },
  treeSelectorTarget: {
    color: "#4CAF50",
    fontWeight: 600,
  },
  targetBadge: {
    marginLeft: "8px",
    background: "#4CAF50",
    color: "#fff",
    padding: "1px 4px",
    borderRadius: "2px",
    fontSize: "9px",
    fontWeight: 600,
  },
};