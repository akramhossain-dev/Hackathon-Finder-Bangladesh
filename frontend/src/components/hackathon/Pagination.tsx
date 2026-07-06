interface PaginationProps {
  page:       number;
  totalPages: number;
  onNext:     () => void;
  onPrev:     () => void;
}

/**
 * Pagination — prev/next controls with page info.
 */
export default function Pagination({ page, totalPages, onNext, onPrev }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav className="pagination" aria-label="Pagination">
      <button
        id="page-prev"
        onClick={onPrev}
        disabled={page <= 1}
        className="pagination-btn"
        aria-label="Previous page"
      >
        ← Prev
      </button>

      <span className="pagination-info" aria-live="polite">
        Page {page} of {totalPages}
      </span>

      <button
        id="page-next"
        onClick={onNext}
        disabled={page >= totalPages}
        className="pagination-btn"
        aria-label="Next page"
      >
        Next →
      </button>
    </nav>
  );
}
