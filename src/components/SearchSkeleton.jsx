'use client'

const CardSkeleton = () => (
  <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
    {/* Card Header Skeleton */}
    <div className="px-5 pt-5 pb-3">
      <div className="h-5 bg-gray-200 rounded-md w-3/4"></div>
    </div>

    {/* Card Image Skeleton */}
    <div className="px-4">
      <div className="h-44 bg-gray-200 rounded-2xl w-full"></div>
    </div>

    {/* Card Content Skeleton */}
    <div className="p-5 pt-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-4 h-4 bg-gray-200 rounded-full"></div>
            ))}
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-gray-100"></div>
      </div>
    </div>
  </div>
)

const FilterSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-7 bg-gray-200 rounded w-1/4 mb-6"></div>
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="mb-5">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
        <div className="h-10 bg-gray-200 rounded-full w-full"></div>
      </div>
    ))}
  </div>
)

export const SearchSkeleton = ({ type = 'grid' }) => {
  if (type === 'filters') return <FilterSkeleton />
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  )
}

export default SearchSkeleton