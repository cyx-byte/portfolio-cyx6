import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-screen bg-stone-50">
      <div className="text-center">
        <h1 className="font-serif text-6xl text-stone-300 mb-4">404</h1>
        <p className="text-stone-400 mb-8">页面不存在</p>
        <Link
          href="/"
          className="text-sm text-stone-500 hover:text-stone-700 tracking-[0.1em] transition-colors"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
