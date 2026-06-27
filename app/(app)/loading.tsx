export default function AppLoading() {
  return (
    <>
      <div className="border-b bg-card px-5 py-5 sm:px-8">
        <div className="h-7 w-40 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-muted" />
      </div>
      <div className="space-y-6 p-5 sm:p-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl border bg-card shadow-card"
            />
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-xl border bg-card shadow-card" />
      </div>
    </>
  );
}
