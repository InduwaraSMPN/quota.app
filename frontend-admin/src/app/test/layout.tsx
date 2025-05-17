import Link from "next/link";

export default function TestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-primary font-semibold">
                quota.app Admin
              </Link>
              <div className="h-4 w-px bg-gray-300"></div>
              <span className="text-gray-500">Test Tools</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/test/ping"
                className="text-sm text-gray-600 hover:text-primary"
              >
                Ping Test
              </Link>
              <Link
                href="/test/session"
                className="text-sm text-gray-600 hover:text-primary"
              >
                Session Test
              </Link>
              <Link
                href="/test/session-ping"
                className="text-sm text-gray-600 hover:text-primary"
              >
                Session Ping
              </Link>
              <Link
                href="/test/email"
                className="text-sm text-gray-600 hover:text-primary"
              >
                Email Test
              </Link>
              <Link
                href="/auth/signup"
                className="text-sm text-gray-600 hover:text-primary"
              >
                Signup Page
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {children}
    </div>
  );
}
