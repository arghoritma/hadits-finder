import HadithSearchPage from '@/components/hadith-search-page';
import Header from '@/components/header';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <HadithSearchPage />
      </main>
      <footer className="bg-secondary text-secondary-foreground py-4 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Hadith Finder. All rights reserved.</p>
      </footer>
    </div>
  );
}
