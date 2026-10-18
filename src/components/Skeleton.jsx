export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 animate-pulse">
      <div className="h-44 bg-gray-200 dark:bg-gray-800" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
        <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded" />
      </div>
    </div>
  );
}

export function SkeletonList() {
  return (
    <div className="flex gap-4 bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 animate-pulse">
      <div className="w-28 h-20 bg-gray-200 dark:bg-gray-800 rounded-xl shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
        <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
      </div>
    </div>
  );
}
