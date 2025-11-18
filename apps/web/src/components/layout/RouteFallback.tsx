export const RouteFallback = () => (
  <div className="flex min-h-[50vh] items-center justify-center">
    <div className="flex flex-col items-center gap-3 text-gray-500">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-primary-500" />
      <p className="text-sm font-medium">Loading the next lesson...</p>
    </div>
  </div>
);
