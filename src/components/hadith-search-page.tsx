
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Search, Loader2, Frown, BookMarked, UserCheck, Tag, Hash, CheckCircle2, XCircle, Info } from 'lucide-react';
import type { Hadith, SearchResult } from '@/services/dorar-api';
import { searchHadiths as searchHadithsApi } from '@/services/dorar-api';
import Link from 'next/link';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

const getGradeInfo = (grade: string) => {
  const lowerCaseGrade = grade.toLowerCase();
  if (lowerCaseGrade.includes("صحيح") || lowerCaseGrade.includes("sahih") || lowerCaseGrade.includes("good") || lowerCaseGrade.includes("authentic")) {
    return { icon: <CheckCircle2 className="w-4 h-4 ml-2 text-green-500" />, className: "text-green-500" };
  }
  if (lowerCaseGrade.includes("حسن") || lowerCaseGrade.includes("hasan")) {
    return { icon: <CheckCircle2 className="w-4 h-4 ml-2 text-yellow-500" />, className: "text-yellow-500" };
  }
  if (lowerCaseGrade.includes("ضعيف") || lowerCaseGrade.includes("dhaif") || lowerCaseGrade.includes("weak")) {
    return { icon: <XCircle className="w-4 h-4 ml-2 text-red-500" />, className: "text-red-500" };
  }
  return { icon: <Info className="w-4 h-4 ml-2 text-muted-foreground" />, className: "text-muted-foreground" };
};


export default function HadithSearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Hadith[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalResults, setTotalResults] = useState(0);

  const ITEMS_PER_PAGE = 10; 

  const handleSearch = async (page: number = 1) => {
    if (!searchTerm.trim()) {
      setError('Please enter a search term.');
      setSearchResults([]);
      setTotalPages(0);
      setTotalResults(0);
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentPage(page);

    try {
      const response: SearchResult = await searchHadithsApi(searchTerm, page);
      
      if (response && response.data) {
        setSearchResults(response.data);
        const numResults = parseInt(response.metadata.length, 10) || response.data.length;
        setTotalResults(numResults);
        
        setTotalPages(Math.max(1, Math.ceil(numResults / (response.data.length > 0 ? response.data.length : ITEMS_PER_PAGE))));
        if (response.data.length === 0) {
          setError('No Hadiths found for your search term.');
        }
      } else {
        setSearchResults([]);
        setError('No Hadiths found or invalid response from API.');
        setTotalPages(0);
        setTotalResults(0);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to fetch Hadiths. Please try again later.');
      setSearchResults([]);
      setTotalPages(0);
      setTotalResults(0);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleSearch(1); 
  };

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      handleSearch(page);
    }
  };
  
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      setTotalPages(0);
      setTotalResults(0);
      setError(null);
    }
  }, [searchTerm]);

  return (
    <div className="space-y-8" dir="rtl">
      <Card className="shadow-lg border-accent/30">
        <CardHeader className="border-b border-accent/20 pb-4">
          <CardTitle className="text-xl md:text-2xl font-semibold text-primary flex items-center">
            <Search className="w-6 h-6 ml-2 text-accent" />
            ابحث عن حديث
          </CardTitle>
          <CardDescription className="text-muted-foreground">أدخل كلمات رئيسية للبحث عن الأحاديث النبوية الشريفة</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <Input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="مثال: إنما الأعمال بالنيات"
              className="flex-grow text-base"
              aria-label="Search Hadith"
            />
            <Button type="submit" disabled={isLoading} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري البحث...
                </>
              ) : (
                <>
                  <Search className="ml-2 h-4 w-4" />
                  بحث
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="shadow-md">
          <Frown className="h-5 w-5" />
          <AlertTitle>خطأ في البحث</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading && !error && (
         <div className="flex justify-center items-center py-10">
            <Loader2 className="h-12 w-12 text-accent animate-spin" />
            <p className="ml-4 text-lg text-muted-foreground">جاري تحميل الأحاديث...</p>
        </div>
      )}

      {!isLoading && searchResults.length > 0 && (
        <div className="space-y-6">
          <p className="text-muted-foreground">تم العثور على {totalResults} نتيجة.</p>
          {searchResults.map((hadith, index) => {
            const gradeInfo = getGradeInfo(hadith.grade);
            return (
              <Card key={hadith.hadithId || index} className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-primary/30">
                <CardHeader className="bg-primary/10 rounded-t-md">
                  <CardTitle className="text-lg md:text-xl text-primary p-3" style={{direction: 'rtl'}}>
                    {hadith.hadith.length > 100 ? `${hadith.hadith.substring(0, 100)}...` : hadith.hadith}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm md:text-base p-4" style={{direction: 'rtl'}}>
                  <p className="flex items-center"><UserCheck className="w-4 h-4 ml-2 text-muted-foreground" /><strong>الراوي:</strong> {hadith.rawi}</p>
                  <p className="flex items-center"><BookMarked className="w-4 h-4 ml-2 text-muted-foreground" /><strong>الكتاب:</strong> {hadith.book}</p>
                  <p className="flex items-center"><Tag className="w-4 h-4 ml-2 text-muted-foreground" /><strong>المحدث:</strong> {hadith.mohdith}</p>
                  <p className="flex items-center"><Hash className="w-4 h-4 ml-2 text-muted-foreground" /><strong>رقم الحديث/الصفحة:</strong> {hadith.numberOrPage}</p>
                  <p className="flex items-center">
                    {gradeInfo.icon}
                    <strong>درجة الصحة:</strong> <span className={gradeInfo.className}>{hadith.grade}</span>
                  </p>
                  {hadith.explainGrade && <p className="flex items-start"><Info className="w-4 h-4 ml-2 mt-1 text-muted-foreground flex-shrink-0" /><strong>توضيح درجة الصحة:</strong> {hadith.explainGrade}</p>}
                  {hadith.hadithId && (
                     <Button asChild variant="link" className="p-0 h-auto text-accent hover:text-accent/80">
                       <Link href={`/hadith/${hadith.hadithId}`}>
                         عرض التفاصيل
                       </Link>
                     </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
          {totalPages > 1 && (
             <Pagination dir="ltr">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage - 1); }} aria-disabled={currentPage <= 1} className={currentPage <=1 ? "pointer-events-none opacity-50" : ""}/>
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(pageNum); }} isActive={currentPage === pageNum}>
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if ( (pageNum === currentPage - 2 && currentPage > 3) || (pageNum === currentPage + 2 && currentPage < totalPages -2) ) {
                    return <PaginationEllipsis key={`ellipsis-${pageNum}`} />;
                  }
                  return null;
                })}
                <PaginationItem>
                  <PaginationNext href="#" onClick={(e) => { e.preventDefault(); handlePageChange(currentPage + 1); }} aria-disabled={currentPage >= totalPages} className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}/>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}
    </div>
  );
}
