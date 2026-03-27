import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <p className="text-8xl font-black text-slate-200 mb-4">404</p>
      <h1 className="text-xl font-black text-slate-900 mb-2">Faqja nuk u gjet</h1>
      <p className="text-sm text-slate-500 mb-8">Adresa që kërkuat nuk ekziston.</p>
      <Link
        to="/dashboard"
        className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors"
      >
        Kthehu në Ballinë
      </Link>
    </div>
  );
}
