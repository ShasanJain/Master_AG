import { Metadata } from 'next';
import AcademicClient from './AcademicClient';

export const metadata: Metadata = {
  title: 'Academic Search | Jack Industrial',
  description: 'Search scientific literature from arXiv, OpenAlex, and more. Real-time streaming results with PDF access and citation data.',
};

export default function AcademicPage() {
  return (
    <main className="p-8">
      <AcademicClient />
    </main>
  );
}
