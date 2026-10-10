import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="empty-state">
      <h2>That page isn’t here</h2>
      <p>Your household overview is a good place to start.</p>
      <Link href="/" className="button primary">
        Back to overview
      </Link>
    </div>
  );
}
