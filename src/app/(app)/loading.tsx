export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-56 bg-border rounded-md" />
      <div className="h-4 w-80 max-w-full bg-border/70 rounded-md" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        <div className="h-24 bg-card border border-border rounded-lg" />
        <div className="h-24 bg-card border border-border rounded-lg" />
        <div className="h-24 bg-card border border-border rounded-lg" />
      </div>
    </div>
  );
}
