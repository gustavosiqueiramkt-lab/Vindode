'use client'

export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-gray-200 p-6 bg-white">
      <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
      <div className="h-8 bg-gray-200 rounded w-32"></div>
    </div>
  )
}

export function SkeletonChart() {
  return (
    <div className="rounded-lg border border-gray-200 p-6 bg-white">
      <div className="h-4 bg-gray-200 rounded w-32 mb-6"></div>
      <div className="flex items-end justify-between gap-2 h-64">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="flex-1 bg-gray-200 rounded"
            style={{ height: `${Math.random() * 100 + 50}%` }}
          ></div>
        ))}
      </div>
    </div>
  )
}

export function SkeletonTable() {
  return (
    <div className="rounded-lg border border-gray-200 p-6 bg-white">
      <div className="h-4 bg-gray-200 rounded w-32 mb-6"></div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <div className="h-4 bg-gray-200 rounded flex-1"></div>
            <div className="h-4 bg-gray-200 rounded flex-1"></div>
            <div className="h-4 bg-gray-200 rounded flex-1"></div>
          </div>
        ))}
      </div>
    </div>
  )
}
