export default function MessageThreadLoading() {
  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="rounded-lg border p-6">
        <div className="h-4 w-40 rounded bg-muted" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="h-12 rounded bg-muted" />
          ))}
        </div>
      </div>
    </div>
  );
}
