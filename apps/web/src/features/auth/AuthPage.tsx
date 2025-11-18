import { Button } from '@/components/ui/Button';

const AuthPage = () => (
  <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700">
    <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">LinguaLearn</h1>
        <p className="mt-2 text-sm text-gray-500">
          Start your language adventure
        </p>
      </div>

      <form className="mt-8 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              className="mt-1 w-full rounded-2xl border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              className="mt-1 w-full rounded-2xl border border-gray-300 px-4 py-2 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <Button variant="primary" size="lg" fullWidth type="submit">
          Sign In
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-gray-500">
        Demo credentials: <strong>admin@demo.com</strong> / <strong>demo123</strong>
      </p>
    </div>
  </div>
);

export default AuthPage;
