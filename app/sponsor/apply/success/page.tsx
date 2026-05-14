
'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const tier = searchParams.get('tier');
  const amount = searchParams.get('amount');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl max-w-md text-center">
        <h1 className="text-3xl font-bold mb-4">Application Submitted!</h1>
        <p className="mb-4">
          Thank you for your sponsorship application. We have sent a confirmation email to the address you provided.
        </p>
        {tier && amount && (
          <p className="mb-6">
            You applied for <strong className="capitalize">{tier}</strong> with an investment of <strong>${parseFloat(amount).toLocaleString()}</strong>.
          </p>
        )}
        <Link
          href="/"
          className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-2 rounded transition"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}