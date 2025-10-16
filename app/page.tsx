import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="mb-4 text-6xl font-bold text-gray-900">
          Sentinel
        </h1>
        <p className="mb-8 text-xl text-gray-600">
          Automated peace of mind for managing course syllabi and deadlines
        </p>
        <Link
          href="/dashboard"
          className="inline-block rounded-lg bg-purple-600 px-8 py-3 text-white font-medium hover:bg-purple-700 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
