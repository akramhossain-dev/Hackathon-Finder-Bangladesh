interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

/**
 * ErrorState — shown when an API call fails.
 */
export default function ErrorState({
  title = "Something went wrong",
  description = "Failed to load content. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon error-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <p className="empty-state-title">{title}</p>
      <p className="empty-state-desc">{description}</p>
      {onRetry && (
        <div className="empty-state-action">
          <button onClick={onRetry} className="filter-btn-primary" id="error-retry-btn">
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
