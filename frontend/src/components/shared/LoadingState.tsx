interface LoadingStateProps {
  message?: string;
  count?: number; /** number of skeleton cards to show */
}

/**
 * LoadingState — skeleton card grid for hackathon list loading.
 */
export default function LoadingState({ message, count = 6 }: LoadingStateProps) {
  if (message) {
    return (
      <div className="loading-state-centered">
        <div className="loading-spinner-lg" />
        <p className="loading-state-msg">{message}</p>
      </div>
    );
  }

  return (
    <div className="hackathons-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-banner" />
          <div className="skeleton-body">
            <div className="skeleton-line skeleton-line-short" />
            <div className="skeleton-line skeleton-line-full" />
            <div className="skeleton-line skeleton-line-mid" />
            <div className="skeleton-line skeleton-line-short" />
          </div>
        </div>
      ))}
    </div>
  );
}
