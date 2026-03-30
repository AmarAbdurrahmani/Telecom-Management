/**
 * Status / type badge with a small dot indicator.
 * Variants are auto-mapped from known Albanian values.
 */
const VARIANTS = {
  // Statusi klientit
  aktiv:      'bg-green-50   text-green-700   dot-green',
  pasiv:      'bg-slate-100  text-slate-500   dot-slate',
  pezulluar:  'bg-amber-50   text-amber-700   dot-amber',
  // Lloji klientit
  individual: 'bg-blue-50    text-blue-700    dot-blue',
  biznes:     'bg-violet-50  text-violet-700  dot-violet',
  vip:        'bg-yellow-50  text-yellow-700  dot-yellow',
  // Statusi paketës
  aktive:     'bg-green-50   text-green-700   dot-green',
  joaktive:   'bg-slate-100  text-slate-500   dot-slate',
  // Statusi kontratës
  e_skaduar:  'bg-red-50     text-red-700     dot-red',
  anulluar:   'bg-slate-100  text-slate-500   dot-slate',
  // Statusi faturës
  e_papaguar: 'bg-amber-50   text-amber-700   dot-amber',
  e_paguar:   'bg-green-50   text-green-700   dot-green',
  e_vonuar:   'bg-red-50     text-red-700     dot-red',
  // Statusi & lloji numrit
  joaktiv:    'bg-slate-100  text-slate-500   dot-slate',
  i_rezervuar:'bg-amber-50   text-amber-700   dot-amber',
  i_portuar:  'bg-blue-50    text-blue-700    dot-blue',
  prepaid:    'bg-sky-50     text-sky-700     dot-sky',
  postpaid:   'bg-indigo-50  text-indigo-700  dot-indigo',
  // Lloji shërbimit
  internet:   'bg-blue-50    text-blue-700    dot-blue',
  telefoni:   'bg-violet-50  text-violet-700  dot-violet',
  tv:         'bg-amber-50   text-amber-700   dot-amber',
  combo:      'bg-emerald-50 text-emerald-700 dot-emerald',
};

const DOT_COLORS = {
  'dot-green':   'bg-green-500',
  'dot-slate':   'bg-slate-400',
  'dot-amber':   'bg-amber-500',
  'dot-blue':    'bg-blue-500',
  'dot-violet':  'bg-violet-500',
  'dot-yellow':  'bg-yellow-500',
  'dot-emerald': 'bg-emerald-500',
  'dot-red':     'bg-red-500',
  'dot-sky':     'bg-sky-500',
  'dot-indigo':  'bg-indigo-500',
};

export default function Badge({ value }) {
  const key      = value?.toLowerCase() ?? '';
  const classes  = VARIANTS[key] ?? 'bg-slate-100 text-slate-600 dot-slate';
  const parts    = classes.split(' ');
  const dotClass = DOT_COLORS[parts[2]] ?? 'bg-slate-400';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${parts[0]} ${parts[1]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
      {value}
    </span>
  );
}
