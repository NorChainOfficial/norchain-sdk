import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-primary px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-4">Page Not Found</h2>
        <p className="text-white/60 mb-8">The page you're looking for doesn't exist.</p>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-xl bg-primary-light hover:bg-primary transition-colors text-white font-semibold"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}

