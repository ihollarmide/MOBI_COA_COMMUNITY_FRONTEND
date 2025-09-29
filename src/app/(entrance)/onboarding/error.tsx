"use client"; // Error boundaries must be Client Components

export default function OnboardingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <h2>Something went wrong in onboarding page!</h2>
        <p>Error in onboarding page: {JSON.stringify(error)}</p>
        <p>Error message in onboarding page: {error.message}</p>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
