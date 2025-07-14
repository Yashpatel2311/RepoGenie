import React from "react";

export default function BillingPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center py-20">
      <h1 className="mb-4 text-3xl font-bold">Billing</h1>
      <div className="max-w-lg rounded-lg border border-green-200 bg-green-50 p-6 text-center shadow">
        <p className="mb-2 text-lg font-medium">
          🎉 <span className="text-green-700">Good news!</span>
        </p>
        <p className="mb-2">
          Currently, RepoGenie is{" "}
          <span className="font-semibold">free for everyone</span>. There are no
          usage limits.
        </p>
        <p className="text-gray-600">
          Please use the platform responsibly and enjoy all features without
          restrictions.
        </p>
      </div>
    </div>
  );
}
