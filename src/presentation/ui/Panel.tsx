/**
 * Event Inspector Panel - Presentation Layer
 *
 * A distinctive DevTools-style panel with Nord-inspired palette
 * and JetBrains Mono typography.
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

// ─────────────────────────────────────────────────────────────────────────────
// Constants & Theme
// ─────────────────────────────────────────────────────────────────────────────

const formatTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

// Nord-inspired palette
const THEME = {
  // Backgrounds
  bg: "#2E3440",
  bgLight: "#3B4252",
  bgDark: "#1D2430",

  // Foregrounds
  fg: "#ECEFF4",
  fgMuted: "#D8DEE9",
  fgDim: "#8899A6",

  // Accents
  accent: "#88C0D0", // Cyan
  accentGreen: "#A3BE8C", // Green (native)
  accentBlue: "#81A1C1", // Blue (custom)
  accentOrange: "#D08770", // Orange (highlight)
  accentRed: "#BF616A", // Red (danger)

  // Borders
  border: "#4C566A",
  borderLight: "#5E6578",

  // Shadows
  shadow: "rgba(0, 0, 0, 0.4)",

  // Fonts
  fontMono: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
  fontUI: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
};

// Animation timings
const TIMING = {
  fast: "150ms",
  normal: "250ms",
  slow: "400ms",
  easing: "cubic-bezier(0.16, 1, 0.3, 1)",
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles (CSS Custom Properties approach)
// ─────────────────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  // Root
  host: {
    position: "fixed",
    top: 20,
    right: 20,
    width: "400px",
    zIndex: "2147483647",
    fontFamily: THEME.fontUI,
    fontSize: "13px",
    pointerEvents: "auto",
    transition: `width ${TIMING.slow} ${TIMING.easing}`,
  },
  hostExpanded: {
    width: "440px",
  },

  // Panel
  panel: {
    background: THEME.bg,
    color: THEME.fg,
    borderRadius: "12px",
    boxShadow: `0 8px 32px ${THEME.shadow}, 0 0 0 1px ${THEME.border}`,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    maxHeight: "400px",
    opacity: 1,
    transform: "scale(1)",
    transition: `max-height ${TIMING.slow} ${TIMING.easing}, opacity ${TIMING.normal} ${TIMING.easing}, transform ${TIMING.slow} ${TIMING.easing}`,
  },
  panelCollapsing: {
    maxHeight: "0px",
    opacity: 0,
  },
  panelCollapsingResize: {
    maxHeight: "400px",
    transform: "scale(0.95)",
  },
  panelExpanded: {
    maxHeight: "620px",
    transform: "scale(1)",
  },

  // Header
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    background: THEME.bgDark,
    borderBottom: `1px solid ${THEME.border}`,
    flexShrink: 0,
    cursor: "grab",
  },
  title: {
    margin: 0,
    fontSize: "13px",
    fontWeight: 600,
    letterSpacing: "0.5px",
    color: THEME.accent,
  },
  actions: {
    display: "flex",
    gap: "6px",
  },

  // Buttons
  btn: {
    background: THEME.bgLight,
    border: "none",
    color: THEME.fgMuted,
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: 500,
    transition: `all ${TIMING.fast} ease`,
  },
  btnClose: {
    background: THEME.accentRed,
    border: "none",
    color: THEME.fg,
    padding: "6px 10px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 600,
    transition: `all ${TIMING.fast} ease`,
  },
  btnOn: {
    background: THEME.accentGreen,
    border: "none",
    color: THEME.bgDark,
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: 600,
    transition: `all ${TIMING.fast} ease`,
  },
  btnOff: {
    background: THEME.accentOrange,
    border: "none",
    color: THEME.bgDark,
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: 600,
    transition: `all ${TIMING.fast} ease`,
  },
  backBtn: {
    background: THEME.accent,
    border: "none",
    color: THEME.bgDark,
    padding: "8px 16px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "12px",
    fontWeight: 600,
    transition: `all ${TIMING.fast} ${TIMING.easing}`,
  },
  minimizeBtn: {
    background: THEME.bgLight,
    border: "none",
    color: THEME.fgMuted,
    padding: "6px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "11px",
    fontWeight: 600,
    transition: `all ${TIMING.fast} ${TIMING.easing}`,
  },

  // Event List
  eventList: {
    maxHeight: "340px",
    overflowY: "auto",
    padding: "12px",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  virtualScrollContainer: {
    overflowY: "auto",
    scrollbarWidth: "thin",
    scrollbarColor: `${THEME.border} transparent`,
  },

  // Groups
  group: {
    marginBottom: "4px",
  },
  groupHeader: {
    display: "flex",
    alignItems: "center",
    padding: "6px 10px",
    background: THEME.bgLight,
    borderRadius: "6px",
    cursor: "pointer",
    userSelect: "none",
    transition: `all ${TIMING.fast} ease`,
    gap: "8px",
  },
  collapseIcon: {
    fontSize: "10px",
    color: THEME.fgDim,
    transition: `transform ${TIMING.fast} ease`,
  },
  groupCount: {
    marginLeft: "auto",
    fontSize: "11px",
    color: THEME.fgDim,
    background: THEME.bgDark,
    padding: "2px 8px",
    borderRadius: "10px",
  },

  // Event Items
  eventItem: {
    padding: "6px 10px",
    borderRadius: "6px",
    background: THEME.bgLight,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    transition: `all ${TIMING.fast} ease`,
  },
  eventItemHover: {
    background: THEME.border,
  },
  eventName: {
    fontFamily: THEME.fontMono,
    fontWeight: 600,
    fontSize: "12px",
    color: THEME.fg,
    flexShrink: 0,
  },
  eventTarget: {
    fontFamily: THEME.fontMono,
    fontSize: "11px",
    color: THEME.fgDim,
    flex: 1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  eventTime: {
    fontFamily: THEME.fontMono,
    fontSize: "10px",
    color: THEME.fgDim,
    opacity: 0.7,
    flexShrink: 0,
  },

  // Badges
  badgeNative: {
    background: THEME.accentGreen,
    color: THEME.bgDark,
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  badgeCustom: {
    background: THEME.accentBlue,
    color: THEME.fg,
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "10px",
    fontWeight: 700,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },

  // Detail View
  detailView: {
    padding: "16px",
    opacity: 0,
    transform: "translateY(-12px)",
    transition: `opacity ${TIMING.normal} ${TIMING.easing}, transform ${TIMING.normal} ${TIMING.easing}`,
    maxHeight: "540px",
    overflowY: "auto",
    scrollbarWidth: "thin",
    scrollbarColor: `${THEME.border} transparent`,
  },
  detailViewVisible: {
    opacity: 1,
    transform: "translateY(0)",
  },
  detailViewExiting: {
    opacity: 0,
    transform: "translateY(-8px)",
    transition: `opacity ${TIMING.fast} ease, transform ${TIMING.fast} ease`,
  },
  detailViewMinimized: {
    maxHeight: "0px",
    overflow: "hidden",
    visibility: "hidden",
    opacity: 0,
    padding: 0,
    margin: 0,
    border: "none",
  },
  detailViewMinimizedShow: {
    maxHeight: "0px",
    overflow: "hidden",
    visibility: "visible",
    opacity: 1,
    padding: "0px",
    margin: "0px",
  },
  detailHeader: {
    marginBottom: "16px",
  },

  // Event Summary (clickable)
  eventSummary: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px",
    padding: "12px",
    background: THEME.bgLight,
    borderRadius: "8px",
    cursor: "pointer",
    transition: `all ${TIMING.fast} ease`,
    border: `1px solid ${THEME.border}`,
    userSelect: "none",
  },
  eventSummaryHover: {
    borderColor: THEME.accentOrange,
    boxShadow: `0 0 12px ${THEME.accentOrange}33`,
  },
  detailEventName: {
    fontFamily: THEME.fontMono,
    fontSize: "18px",
    fontWeight: 700,
    color: THEME.fg,
  },
  highlightHint: {
    marginLeft: "auto",
    fontSize: "10px",
    color: THEME.fgDim,
    opacity: 0.7,
  },

  // Metadata
  eventMeta: {
    marginBottom: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  metaRow: {
    display: "flex",
    alignItems: "flex-start",
    fontSize: "12px",
    gap: "8px",
  },
  metaLabel: {
    color: THEME.fgDim,
    minWidth: "60px",
    fontSize: "11px",
  },
  metaValue: {
    color: THEME.fgMuted,
  },
  metaCode: {
    fontFamily: THEME.fontMono,
    fontSize: "11px",
    color: THEME.accent,
    background: THEME.bgDark,
    padding: "3px 8px",
    borderRadius: "4px",
    wordBreak: "break-all",
    border: `1px solid ${THEME.border}`,
  },

  // Tree Section
  treeSection: {
    borderTop: `1px solid ${THEME.border}`,
    paddingTop: "16px",
  },
  treeTitle: {
    margin: "0 0 12px 0",
    fontSize: "11px",
    fontWeight: 600,
    color: THEME.fgDim,
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  domTree: {
    fontFamily: THEME.fontMono,
    fontSize: "11px",
    lineHeight: 1.3,
  },
  treeEmpty: {
    color: THEME.fgDim,
    fontStyle: "italic",
    padding: "8px",
    fontSize: "12px",
  },
  treeNode: {
    display: "flex",
    alignItems: "center",
  },
  treeArrow: {
    color: THEME.borderLight,
    marginRight: "6px",
    userSelect: "none",
  },
  treeSelector: {
    color: THEME.fgMuted,
  },
  treeSelectorTarget: {
    color: THEME.accentGreen,
    fontWeight: 700,
  },
  targetBadge: {
    marginLeft: "10px",
    background: THEME.accentGreen,
    color: THEME.bgDark,
    padding: "2px 6px",
    borderRadius: "3px",
    fontSize: "9px",
    fontWeight: 700,
    letterSpacing: "0.5px",
  },

  // Minimized
  minimizedCount: {
    position: "absolute",
    top: "8px",
    right: "8px",
    background: THEME.accentOrange,
    color: THEME.bgDark,
    padding: "2px 8px",
    borderRadius: "10px",
    fontSize: "10px",
    fontWeight: 700,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// VirtualScroll Component - Generic with smooth scrolling
// ─────────────────────────────────────────────────────────────────────────────

interface VirtualScrollProps<T> {
  items: T[];
  itemHeight: number;
  maxHeight?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  emptyMessage?: string;
}

function VirtualScroll<T>({
  items,
  itemHeight,
  maxHeight = 300,
  renderItem,
  emptyMessage = "No items",
}: VirtualScrollProps<T>) {
  const containerRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node) {
        node.style.overflowY = "auto";
        node.style.maxHeight = `${maxHeight}px`;
      }
    },
    [maxHeight],
  );

  if (!items.length) {
    return (
      <div style={{ ...styles.treeEmpty, padding: "12px" }}>{emptyMessage}</div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={styles.virtualScrollContainer}
      className="event-inspector-scroll"
    >
      <div style={{ height: items.length * itemHeight, position: "relative" }}>
        {items.map((item, i) => (
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
            {renderItem(item, i)}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DomTree Component - Renders the event propagation path
// ─────────────────────────────────────────────────────────────────────────────

function DomTree({ path }: { path: Element[] }) {
  if (!path || path.length === 0) {
    return <div style={styles.treeEmpty}>No path available</div>;
  }

  const reversedPath = [...path].reverse();
  const ITEM_HEIGHT = 20;

  const renderNode = (el: Element, i: number) => {
    const selector = getCssSelector(el);
    const target = i === 0;

    return (
      <div style={{ ...styles.treeNode, paddingLeft: `${i * 14 + 8}px` }}>
        <span style={styles.treeArrow}>├──</span>
        <span style={target ? styles.treeSelectorTarget : styles.treeSelector}>
          {selector}
        </span>
        {target && <span style={styles.targetBadge}>TARGET</span>}
      </div>
    );
  };

  return (
    <div style={styles.domTree}>
      <VirtualScroll
        items={reversedPath}
        itemHeight={ITEM_HEIGHT}
        maxHeight={280}
        renderItem={renderNode}
        emptyMessage="No path available"
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EventDetailView Component - Expanded detail view
// ─────────────────────────────────────────────────────────────────────────────

interface EventDetailViewProps {
  event: EventRecord;
  onBack: () => void;
  onTargetClick: (element: Element) => void;
  isExiting?: boolean;
  isMinimized?: boolean;
}

function EventDetailView({
  event,
  onBack,
  onTargetClick,
  isExiting,
  isMinimized = false,
}: EventDetailViewProps) {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (isExiting) {
      setVisible(false);
    } else {
      const timer = setTimeout(() => setVisible(true), 50);
      return () => clearTimeout(timer);
    }
  }, [isExiting]);

  return (
    <div
      style={{
        ...styles.detailView,
        ...(visible ? styles.detailViewVisible : {}),
        ...(isExiting ? styles.detailViewExiting : {}),
      }}
    >
      {/* Header */}
      <div style={styles.detailHeader}>
        <button
          style={styles.backBtn}
          onClick={onBack}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateX(-2px)";
            e.currentTarget.style.boxShadow = `0 4px 12px ${THEME.shadow}`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateX(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          ← Back
        </button>
      </div>

      {/* Content - this collapses when minimized */}
      <div
        style={{
          overflow: isMinimized ? "hidden" : "auto",
          maxHeight: isMinimized ? "0px" : "none",
          transition: `max-height ${TIMING.normal} ${TIMING.easing}`,
        }}
      >
        {/* Event Summary - Clickable */}
        <div
          style={{
            ...styles.eventSummary,
            ...(hovered ? styles.eventSummaryHover : {}),
          }}
          onClick={() => onTargetClick(event.targetElement)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <span
            style={
              event.eventType === "native"
                ? styles.badgeNative
                : styles.badgeCustom
            }
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
              <span style={styles.metaValue}>
                {event.bubbles ? "Yes" : "No"}
              </span>
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
          <h4 style={styles.treeTitle}>Event Path</h4>
          <DomTree path={event.composedPath || []} />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EventListItem Component - Single event with hover states
// ─────────────────────────────────────────────────────────────────────────────

function EventListItem({
  event,
  onClick,
}: {
  event: EventRecord;
  onClick: (e: EventRecord) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        ...styles.eventItem,
        ...(hovered ? styles.eventItemHover : {}),
      }}
      onClick={() => onClick(event)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={styles.eventName}>{event.name}</span>
      <span style={styles.eventTarget}>{event.target}</span>
      <span style={styles.eventTime}>{formatTime(event.timestamp)}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EventListView Component - Event group with virtual scroll
// ─────────────────────────────────────────────────────────────────────────────

const EVENT_ITEM_HEIGHT = 32;

interface EventListViewProps {
  events: EventRecord[];
  collapsed: boolean;
  onToggle: () => void;
  onEventClick: (event: EventRecord) => void;
  type: "native" | "custom";
}

function EventListView({
  events,
  collapsed,
  onToggle,
  onEventClick,
  type,
}: EventListViewProps) {
  return (
    <div style={styles.group}>
      <div style={styles.groupHeader} onClick={onToggle}>
        <span
          style={{
            ...styles.collapseIcon,
            transform: collapsed ? "rotate(0deg)" : "rotate(90deg)",
          }}
        >
          ▶
        </span>
        <span
          style={type === "native" ? styles.badgeNative : styles.badgeCustom}
        >
          {type === "native" ? "Native" : "Custom"}
        </span>
        <span style={styles.groupCount}>{events.length}</span>
      </div>
      {!collapsed && events.length > 0 && (
        <VirtualScroll
          items={events}
          itemHeight={EVENT_ITEM_HEIGHT}
          maxHeight={180}
          renderItem={(event) => (
            <EventListItem event={event} onClick={onEventClick} />
          )}
          emptyMessage={`No ${type} events`}
        />
      )}
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
  const [nativeCollapsed, setNativeCollapsed] = useState(false);
  const [customCollapsed, setCustomCollapsed] = useState(true);

  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Dragging state
  const [position, setPosition] = useState({
    x: window.innerWidth - 420 - 20,
    y: 20,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    },
    [position],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      // Margen mínimo desde los bordes
      const margin = 20;

      // Get panel dimensions (approximate)
      const panelWidth = 400;
      const panelMinHeight = 60;

      // Calculate boundaries to keep panel on screen with margin
      const maxX = window.innerWidth - panelWidth - margin;
      const maxY = window.innerHeight - panelMinHeight - margin;

      setPosition({
        x: Math.max(margin, Math.min(maxX, e.clientX - dragOffset.x)),
        y: Math.max(margin, Math.min(maxY, e.clientY - dragOffset.y)),
      });
    },
    [isDragging, dragOffset],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global mouse event listeners when dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

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
    }, 200);
  }, []);

  // Toggle minimize - same state for both views
  const handleDetailMinimize = useCallback(() => {
    setMinimized((prev) => !prev);
  }, []);

  const handleTargetClick = useCallback((element: Element) => {
    if (!element || !element.isConnected) return;

    const el = element as HTMLElement;

    // Scroll into view
    el.scrollIntoView({ behavior: "smooth", block: "center" });

    // Ripple outline animation - shrinks from small to element size
    const rect = el.getBoundingClientRect();
    const startScale = 1.15; // Start 15% larger than element

    const ripple = document.createElement("div");
    ripple.style.cssText = `
      position: fixed;
      left: ${rect.left - (rect.width * (startScale - 1)) / 2}px;
      top: ${rect.top - (rect.height * (startScale - 1)) / 2}px;
      width: ${rect.width * startScale}px;
      height: ${rect.height * startScale}px;
      border: 3px solid ${THEME.accentOrange};
      border-radius: 6px;
      pointer-events: none;
      user-select: none;
      z-index: 2147483646;
      opacity: 1;
    `;
    document.body.appendChild(ripple);

    const startTime = performance.now();
    const duration = 400;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      const scale = startScale - (startScale - 1) * eased;
      const currentWidth = rect.width * scale;
      const currentHeight = rect.height * scale;

      ripple.style.width = `${currentWidth}px`;
      ripple.style.height = `${currentHeight}px`;
      ripple.style.left = `${rect.left - (currentWidth - rect.width) / 2}px`;
      ripple.style.top = `${rect.top - (currentHeight - rect.height) / 2}px`;
      ripple.style.opacity =
        progress > 0.6 ? String(1 - (progress - 0.6) / 0.4) : "1";

      if (progress >= 1) {
        ripple.style.opacity = "0";
        ripple.style.transition = "opacity 0.2s ease-out";
        setTimeout(() => ripple.remove(), 200);
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
        left: position.x,
        top: position.y,
        cursor: isDragging ? "grabbing" : "grab",
        ...(isExpanded ? styles.hostExpanded : {}),
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        style={{
          ...styles.panel,
          ...(isExpanded && !isExiting ? styles.panelExpanded : {}),
          ...(isExiting ? styles.panelCollapsingResize : {}),
        }}
      >
        {/* Header */}
        <div style={styles.header}>
          <h3 style={styles.title}>
            {isExpanded ? "Event Detail" : "⚡ Event Inspector"}
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
            {isExpanded && (
              <button
                style={styles.minimizeBtn}
                onClick={handleDetailMinimize}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.1)";
                  e.currentTarget.style.boxShadow = `0 2px 8px ${THEME.shadow}`;
                  e.currentTarget.style.background = THEME.border;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = THEME.bgLight;
                }}
                title={minimized ? "Expand" : "Minimize"}
              >
                {minimized ? "+" : "_"}
              </button>
            )}
            {/* Botón minimize - siempre visible cuando no está expandido */}
            {!isExpanded && (
              <button
                style={styles.minimizeBtn}
                onClick={handleMinimize}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.1)";
                  e.currentTarget.style.boxShadow = `0 2px 8px ${THEME.shadow}`;
                  e.currentTarget.style.background = THEME.border;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.background = THEME.bgLight;
                }}
                title={minimized ? "Expand" : "Minimize"}
              >
                {minimized ? "+" : "_"}
              </button>
            )}
            <button style={styles.btnClose} onClick={handleClose}>
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        {!isExpanded ? (
          !minimized && (
            <div style={styles.eventList}>
              <EventListView
                events={nativeEvents}
                collapsed={nativeCollapsed}
                onToggle={() => setNativeCollapsed(!nativeCollapsed)}
                onEventClick={handleEventClick}
                type="native"
              />
              <EventListView
                events={customEvents}
                collapsed={customCollapsed}
                onToggle={() => setCustomCollapsed(!customCollapsed)}
                onEventClick={handleEventClick}
                type="custom"
              />
            </div>
          )
        ) : selectedEvent ? (
          <EventDetailView
            event={selectedEvent}
            onBack={handleBack}
            onTargetClick={handleTargetClick}
            isExiting={isExiting}
            isMinimized={minimized}
          />
        ) : null}
      </div>
    </div>
  );
}
