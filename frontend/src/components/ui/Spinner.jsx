export default function Spinner({ className = 'w-6 h-6' }) {
  return (
    <span
      className={`inline-block border-2 border-slate-200 border-t-slate-700 rounded-full animate-spin ${className}`}
    />
  );
}
