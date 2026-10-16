import { LESSONS } from '@/lib/content';
import { Player } from '@/components/player';

export const dynamicParams = false;
export const generateStaticParams = () => LESSONS.map((l) => ({ id: l.id }));

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <Player id={id} />;
}
