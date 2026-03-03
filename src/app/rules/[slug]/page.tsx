import { notFound } from 'next/navigation';
import Markdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { getDocContent, getDocSlugs, getDocTitle } from '@/lib/docs';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getDocSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const slugs = getDocSlugs();
  if (!slugs.includes(slug)) return {};

  const content = getDocContent(slug);
  const title = getDocTitle(content);
  return { title: `${title} — PF2e Lite` };
}

export default async function RulesPage({ params }: Props) {
  const { slug } = await params;
  const slugs = getDocSlugs();
  if (!slugs.includes(slug)) {
    notFound();
  }

  const content = getDocContent(slug);

  return (
    <article className="prose prose-stone mx-auto max-w-3xl prose-headings:scroll-mt-4 prose-a:text-violet-700 prose-a:no-underline hover:prose-a:underline">
      <Markdown rehypePlugins={[rehypeRaw]}>{content}</Markdown>
    </article>
  );
}
