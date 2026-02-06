export default function NotificationsLoading() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="h-8 w-40 rounded bg-muted" />
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="rounded-lg border p-6">
            <div className="h-4 w-48 rounded bg-muted" />
            <div className="mt-2 h-3 w-64 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
