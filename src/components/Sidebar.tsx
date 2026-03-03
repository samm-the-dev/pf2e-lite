'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

interface SidebarProps {
  docs: { slug: string; title: string }[];
}

export default function Sidebar({ docs }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-50 rounded-md border border-stone-300 bg-white p-2 shadow-sm md:hidden"
        aria-label={isOpen ? 'Close navigation' : 'Open navigation'}
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-full w-64 overflow-y-auto border-r border-stone-200 bg-stone-50 p-4 transition-transform md:sticky md:top-0 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Link
          href="/"
          className="mb-4 block text-lg font-bold text-stone-900"
          onClick={() => setIsOpen(false)}
        >
          PF2e Lite
        </Link>

        <nav aria-label="Rules chapters">
          <ul className="space-y-0.5">
            {docs.map(({ slug, title }) => {
              const href = `/rules/${slug}`;
              const isActive = pathname === href;
              const chapterNum = parseInt(slug.split('-')[0], 10);
              const label = `Ch ${chapterNum}: ${title}`;
              return (
                <li key={slug}>
                  <Link
                    href={href}
                    onClick={() => setIsOpen(false)}
                    className={`block rounded px-2 py-1 text-sm transition-colors ${
                      isActive
                        ? 'bg-violet-100 font-medium text-violet-900'
                        : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}
