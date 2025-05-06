import { BookOpenText } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center">
        <BookOpenText className="h-8 w-8 mr-3" />
        <h1 className="text-2xl font-bold">Hadith Finder</h1>
      </div>
    </header>
  );
}
