
// Kaaba SVG Icon component
const KaabaIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props} className={`kaaba-icon ${props.className || ''}`}>
    <path d="M12 2L3 6.5V17.5L12 22L21 17.5V6.5L12 2ZM5 7.5L12 11.25L19 7.5L12 3.75L5 7.5ZM4 16.5V8.25L11 12.375V20.25L4 16.5ZM13 20.25V12.375L20 8.25V16.5L13 20.25Z" />
    <path d="M6 15.25L12 18.5L18 15.25V9.25L12 6L6 9.25V15.25ZM7.5 10.125L12 7.5L16.5 10.125V14.375L12 17L7.5 14.375V10.125Z" fill="hsl(var(--accent))"/> {/* Gold accent for the Kiswah pattern */}
    <rect x="10.5" y="12" width="3" height="4" fill="hsl(var(--accent))" /> {/* Door element */}
  </svg>
);


export default function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center">
        <KaabaIcon className="h-8 w-8 mr-3 text-accent" />
        <h1 className="text-2xl font-bold">Hadith Finder</h1>
      </div>
    </header>
  );
}
