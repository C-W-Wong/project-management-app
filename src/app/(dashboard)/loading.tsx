export default function DashboardLoading() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="h-8 w-48 rounded bg-muted" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="rounded-lg border p-6">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="mt-4 h-8 w-16 rounded bg-muted" />
            <div className="mt-3 h-3 w-20 rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px]">
        <div className="rounded-lg border p-6">
          <div className="h-4 w-40 rounded bg-muted" />
          <div className="mt-6 space-y-4">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-10 rounded bg-muted" />
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="rounded-lg border p-6">
            <div className="h-4 w-40 rounded bg-muted" />
            <div className="mt-6 space-y-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="h-8 rounded bg-muted" />
              ))}
            </div>
          </div>
          <div className="rounded-lg border p-6">
            <div className="h-4 w-40 rounded bg-muted" />
            <div className="mt-6 space-y-3">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="h-8 rounded bg-muted" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
