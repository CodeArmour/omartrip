type SkeletonProps = {
  className?: string;
};

export function Skeleton({ className = "" }: SkeletonProps) {
  return <span className={`skeleton ${className}`} aria-hidden="true" />;
}

export function SkeletonCard({ className = "" }: SkeletonProps) {
  return (
    <article className={`skeleton-card ${className}`} aria-hidden="true">
      <Skeleton className="skeleton-media" />
      <div className="skeleton-card-copy">
        <Skeleton className="skeleton-line skeleton-line-short" />
        <Skeleton className="skeleton-line skeleton-line-title" />
        <Skeleton className="skeleton-line" />
        <Skeleton className="skeleton-line skeleton-line-wide" />
      </div>
      <div className="skeleton-card-footer">
        <Skeleton className="skeleton-pill" />
        <Skeleton className="skeleton-pill skeleton-pill-small" />
      </div>
    </article>
  );
}
