export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black" />
      <span className="ml-3 text-sm text-gray-600">Loading...</span>
    </div>
  );
}
