/**
 * Profile avatar with SVG icon based on client type.
 * individual → person silhouette
 * biznes     → building / office
 * vip        → star
 */

function PersonIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
    </svg>
  );
}

function BuildingIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 21h18v-2H3v2zM3 7v12h4v-4h2v4h4V7H3zm6 8H7v-2h2v2zm0-4H7V9h2v2zm4 4h-2v-2h2v2zm0-4h-2V9h2v2zm6-10V3H13v2H3v16h18V5h-2zm0 14h-4V7h4v12z" />
    </svg>
  );
}

function StarIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

const TYPE_CONFIG = {
  individual: {
    Icon: PersonIcon,
    bg: 'bg-slate-100',
    color: 'text-slate-500',
  },
  biznes: {
    Icon: BuildingIcon,
    bg: 'bg-slate-100',
    color: 'text-slate-500',
  },
  vip: {
    Icon: StarIcon,
    bg: 'bg-amber-50',
    color: 'text-amber-500',
  },
};

export default function ClientAvatar({ lloji = 'individual', size = 'md' }) {
  const cfg = TYPE_CONFIG[lloji] ?? TYPE_CONFIG.individual;
  const { Icon, bg, color } = cfg;

  const sizes = {
    sm:  { wrap: 'w-9 h-9 rounded-xl',  icon: 'w-4 h-4' },
    md:  { wrap: 'w-11 h-11 rounded-xl', icon: 'w-5 h-5' },
    lg:  { wrap: 'w-16 h-16 rounded-2xl',icon: 'w-8 h-8' },
    xl:  { wrap: 'w-20 h-20 rounded-2xl',icon: 'w-10 h-10' },
  };
  const s = sizes[size] ?? sizes.md;

  return (
    <div className={`${s.wrap} ${bg} flex items-center justify-center flex-shrink-0`}>
      <Icon className={`${s.icon} ${color}`} />
    </div>
  );
}
