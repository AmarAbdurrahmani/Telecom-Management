/**
 * Neutral person silhouette avatar for staff/users.
 * No initials — Instagram-style grayscale icon.
 */
export default function UserAvatar({ size = 'md', className = '' }) {
  const sizes = {
    xs:  'w-7 h-7',
    sm:  'w-9 h-9',
    md:  'w-10 h-10',
    lg:  'w-12 h-12',
    xl:  'w-16 h-16',
  };

  return (
    <div className={`${sizes[size] ?? sizes.md} rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 ${className}`}>
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-[55%] h-[55%] text-slate-400"
        aria-hidden="true"
      >
        {/* Head */}
        <circle cx="12" cy="8" r="4" />
        {/* Body */}
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7H4z" />
      </svg>
    </div>
  );
}
