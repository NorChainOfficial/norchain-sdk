export default function Loading() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <div className="animate-pulse">
        <div className="h-10 bg-slate-800 rounded-lg w-64 mb-8"></div>
        <div className="h-12 bg-slate-800 rounded-lg w-full mb-8"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-800 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

