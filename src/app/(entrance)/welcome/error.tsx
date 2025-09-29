"use client"; // Error boundaries must be Client Components

export default function WelcomeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <h2>Something went wrong in welcome page!</h2>
        <p>Error in welcome page: {JSON.stringify(error)}</p>
        <p>Error message in welcome page: {error.message}</p>
        <button onClick={() => reset()}>Try again</button>
      </body>
    </html>
  );
}
