
'use client';

import type { Hadith, SharhMetadata, Muhdith, Book, SearchResult } from '@/services/dorar-api';
import { getHadithById, getSimilarHadithsById, getAlternateHadithsById, getSharhById, getMuhdithById, getBookById } from '@/services/dorar-api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRightLeft, BookText, ChevronLeft, FileTextIcon, Hash, Info, Link2, Network, Users2, BookMarked, CheckCircle2, XCircle, ExternalLink, MessageCircle, Sparkles, Languages, Loader2, AlertCircle } from 'lucide-react';
import Header from '@/components/header';
import HadithAiAnalysis from '@/components/hadith-ai-analysis';
import React, { useState, useEffect } from 'react';
import { translateHadith, type TranslateHadithInput, type TranslateHadithOutput } from '@/ai/flows/translate-hadith-flow';


interface HadithDetailPageProps {
  params: { id: string };
}

interface HadithData {
  hadith: Hadith;
  sharhText: string | null;
  similarHadiths: Hadith[];
  alternateHadith: Hadith | null;
  mohdithInfo: Muhdith | null;
  bookInfo: Book | null;
}

async function fetchHadithAllData(id: string): Promise<HadithData | null> {
  try {
    const hadithResult = await getHadithById(id);
    if (!hadithResult || !hadithResult.data) {
      return null;
    }
    const hadith = hadithResult.data;

    const sharhText = await fetchSharh(hadith.sharhMetadata);
    
    let similarHadiths: Hadith[] = [];
    if (hadith.hasSimilarHadith === 'true' && hadith.hadithId) {
        try {
            const similarResult: SearchResult = await getSimilarHadithsById(hadith.hadithId);
            similarHadiths = similarResult.data;
        } catch (error) {
            console.error("Failed to fetch similar hadiths:", error);
        }
    }

    let alternateHadith: Hadith | null = null;
    if (hadith.hasAlternateHadithSahih === 'true' && hadith.hadithId) {
        try {
            const alternateResult = await getAlternateHadithsById(hadith.hadithId);
            alternateHadith = alternateResult.data;
        } catch (error) {
            console.error("Failed to fetch alternate hadith:", error);
        }
    }
    
    let mohdithInfo: Muhdith | null = null;
    if(hadith.mohdithId) {
        try {
            mohdithInfo = await getMuhdithById(hadith.mohdithId);
        } catch (error) {
            console.error("Failed to fetch Muhaddith info:", error);
        }
    }

    let bookInfo: Book | null = null;
    if(hadith.bookId) {
        try {
            bookInfo = await getBookById(hadith.bookId);
        } catch (error) {
            console.error("Failed to fetch Book info:", error);
        }
    }
    return { hadith, sharhText, similarHadiths, alternateHadith, mohdithInfo, bookInfo };
  } catch (error) {
    console.error("Error fetching hadith details:", error);
    return null;
  }
}


async function fetchSharh(sharhMeta?: SharhMetadata): Promise<string | null> {
  if (sharhMeta?.id && sharhMeta.isContainSharh === 'true' && sharhMeta.urlToGetSharh) {
    try {
      const sharhResult = await getSharhById(sharhMeta.id);
      return sharhResult.data.sharhMetadata?.sharh || null;
    } catch (error) {
      console.error("Failed to fetch sharh:", error);
      return "تعذر تحميل الشرح.";
    }
  }
  return null;
}

const getGradeInfo = (grade: string) => {
  const lowerCaseGrade = grade.toLowerCase();
  if (lowerCaseGrade.includes("صحيح") || lowerCaseGrade.includes("sahih") || lowerCaseGrade.includes("good") || lowerCaseGrade.includes("authentic")) {
    return { icon: <CheckCircle2 className="w-5 h-5 text-green-500" />, className: "text-green-500" };
  }
  if (lowerCaseGrade.includes("حسن") || lowerCaseGrade.includes("hasan")) {
    return { icon: <CheckCircle2 className="w-5 h-5 text-yellow-500" />, className: "text-yellow-500" };
  }
  if (lowerCaseGrade.includes("ضعيف") || lowerCaseGrade.includes("dhaif") || lowerCaseGrade.includes("weak")) {
    return { icon: <XCircle className="w-5 h-5 text-red-500" />, className: "text-red-500" };
  }
  return { icon: <Info className="w-5 h-5 text-muted-foreground" />, className: "text-muted-foreground" };
};


export default function HadithDetailPage({ params }: HadithDetailPageProps) {
  const { id } = params;
  const [hadithData, setHadithData] = useState<HadithData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [translatedHadith, setTranslatedHadith] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);


  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await fetchHadithAllData(id);
      if (data) {
        setHadithData(data);
      } else {
        setError("لم يتم العثور على الحديث المطلوب أو حدث خطأ أثناء التحميل.");
      }
      setLoading(false);
    }
    loadData();
  }, [id]);

  const handleTranslate = async () => {
    if (!hadithData?.hadith.hadith) return;
    setIsTranslating(true);
    setTranslationError(null);
    setTranslatedHadith(null);

    try {
      const input: TranslateHadithInput = { hadithText: hadithData.hadith.hadith };
      const result = await translateHadith(input);
      setTranslatedHadith(result.translatedText);
    } catch (err) {
      console.error('AI Translation Error:', err);
      setTranslationError('حدث خطأ أثناء ترجمة الحديث. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsTranslating(false);
    }
  };


  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 flex justify-center items-center">
          <Loader2 className="h-12 w-12 text-accent animate-spin" />
        </main>
      </div>
    );
  }

  if (error || !hadithData) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Alert variant="destructive">
            <Info className="h-5 w-5" />
            <AlertTitle>خطأ</AlertTitle>
            <AlertDescription>{error || "لم يتم العثور على الحديث."}</AlertDescription>
          </Alert>
           <Button asChild variant="outline" className="mt-4">
              <Link href="/">
                <ChevronLeft className="w-4 h-4 mr-2" />
                العودة للبحث
              </Link>
          </Button>
        </main>
      </div>
    );
  }

  const { hadith, sharhText, similarHadiths, alternateHadith, mohdithInfo, bookInfo } = hadithData;
  
  const aiAnalysisData = {
    hadithText: hadith.hadith, // Use hadith.hadith here
    rawi: hadith.rawi,
    mohdith: hadith.mohdith,
    book: hadith.book,
    grade: hadith.grade,
    explainGrade: hadith.explainGrade,
  };

  const gradeInfo = getGradeInfo(hadith.grade);

  return (
    <div className="flex flex-col min-h-screen bg-background" dir="rtl">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Card className="shadow-xl">
          <CardHeader className="bg-primary text-primary-foreground rounded-t-md p-6">
            <Button asChild variant="ghost" className="absolute top-4 left-4 text-primary-foreground hover:bg-primary/80">
              <Link href="/">
                <ChevronLeft className="w-5 h-5 mr-1" />
                العودة
              </Link>
            </Button>
            <CardTitle className="text-2xl md:text-3xl font-semibold">{hadith.hadith}</CardTitle>
            {hadith.rawi && <CardDescription className="text-primary-foreground/80 pt-2 text-base">الراوي: {hadith.rawi}</CardDescription>}
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base">
              <InfoItem icon={<BookMarked className="w-5 h-5 text-muted-foreground" />} label="الكتاب" value={hadith.book} />
              <InfoItem icon={<Users2 className="w-5 h-5 text-muted-foreground" />} label="المحدث" value={hadith.mohdith} />
              <InfoItem icon={<Hash className="w-5 h-5 text-muted-foreground" />} label="رقم الحديث/الصفحة" value={hadith.numberOrPage} />
              <InfoItem 
                icon={gradeInfo.icon} 
                label="درجة الصحة" 
                value={hadith.grade} 
                valueClassName={gradeInfo.className}
              />
            </div>

            {translatedHadith && (
              <InfoBlock icon={<Languages className="w-5 h-5 text-muted-foreground" />} title="الترجمة إلى الإندونيسية">
                <p className="text-muted-foreground" dir="ltr">{translatedHadith}</p>
              </InfoBlock>
            )}

            {translationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-5 w-5"/>
                <AlertTitle>خطأ في الترجمة</AlertTitle>
                <AlertDescription>{translationError}</AlertDescription>
              </Alert>
            )}

            {!translatedHadith && (
              <Button onClick={handleTranslate} disabled={isTranslating} className="w-full md:w-auto bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                {isTranslating ? (
                  <>
                    <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                    جاري الترجمة...
                  </>
                ) : (
                  <>
                    <Languages className="ml-2 h-4 w-4" />
                    ترجمة إلى الإندونيسية
                  </>
                )}
              </Button>
            )}


            {hadith.explainGrade && (
              <InfoBlock icon={<Info className="w-5 h-5 text-muted-foreground" />} title="توضيح درجة الصحة">
                <p className="text-muted-foreground">{hadith.explainGrade}</p>
              </InfoBlock>
            )}

            {hadith.takhrij && (
              <InfoBlock icon={<FileTextIcon className="w-5 h-5 text-muted-foreground" />} title="التخريج">
                <p className="text-muted-foreground">{hadith.takhrij}</p>
              </InfoBlock>
            )}
            
            {mohdithInfo && (
              <InfoBlock icon={<Users2 className="w-5 h-5 text-muted-foreground" />} title={`معلومات عن المحدث: ${mohdithInfo.name}`}>
                <p className="text-muted-foreground">{mohdithInfo.info}</p>
              </InfoBlock>
            )}

            {bookInfo && (
              <InfoBlock icon={<BookText className="w-5 h-5 text-muted-foreground" />} title={`معلومات عن الكتاب: ${bookInfo.name}`}>
                <p className="text-muted-foreground"><strong>المؤلف:</strong> {bookInfo.author}</p>
                {bookInfo.reviewer && <p className="text-muted-foreground"><strong>المراجع:</strong> {bookInfo.reviewer}</p>}
                {bookInfo.publisher && <p className="text-muted-foreground"><strong>دار النشر:</strong> {bookInfo.publisher}</p>}
                {bookInfo.edition && <p className="text-muted-foreground"><strong>رقم الطبعة:</strong> {bookInfo.edition}</p>}
                {bookInfo.editionYear && <p className="text-muted-foreground"><strong>سنة الطبعة:</strong> {bookInfo.editionYear}</p>}
              </InfoBlock>
            )}

            {sharhText && (
              <InfoBlock icon={<MessageCircle className="w-5 h-5 text-muted-foreground" />} title="شرح الحديث">
                <div className="prose prose-sm max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: sharhText.replace(/\n/g, '<br />') }} />
              </InfoBlock>
            )}

            <Separator />
            
            <HadithAiAnalysis hadithData={aiAnalysisData} />

            <Separator />


            <div className="space-y-4">
              {hadith.similarHadithDorar && (
                <Button variant="outline" asChild className="w-full md:w-auto">
                  <a href={hadith.similarHadithDorar} target="_blank" rel="noopener noreferrer">
                    <Link2 className="w-4 h-4 ml-2" />
                    الأحاديث المشابهة في الدرر السنية
                    <ExternalLink className="w-4 h-4 mr-2" />
                  </a>
                </Button>
              )}
              {hadith.alternateHadithSahihDorar && (
                <Button variant="outline" asChild className="w-full md:w-auto">
                  <a href={hadith.alternateHadithSahihDorar} target="_blank" rel="noopener noreferrer">
                    <Link2 className="w-4 h-4 ml-2" />
                    الحديث الصحيح البديل في الدرر السنية
                    <ExternalLink className="w-4 h-4 mr-2" />
                  </a>
                </Button>
              )}
            </div>
            
            {similarHadiths.length > 0 && (
              <InfoBlock icon={<Network className="w-5 h-5 text-muted-foreground" />} title="أحاديث مشابهة">
                  <ul className="list-disc pl-5 space-y-2">
                      {similarHadiths.map((simHadith, idx) => (
                          <li key={idx} className="text-muted-foreground">
                              <Link href={`/hadith/${simHadith.hadithId}`} className="text-accent hover:underline">
                                  {simHadith.hadith}
                              </Link>
                              <span className="text-xs block text-foreground/70"> - {simHadith.grade}</span>
                          </li>
                      ))}
                  </ul>
              </InfoBlock>
            )}

            {alternateHadith && (
                <InfoBlock icon={<ArrowRightLeft className="w-5 h-5 text-muted-foreground" />} title="حديث صحيح بديل">
                    <p className="text-muted-foreground">
                        <Link href={`/hadith/${alternateHadith.hadithId}`} className="text-accent hover:underline">
                            {alternateHadith.hadith}
                        </Link>
                         <span className="text-xs block text-foreground/70"> - {alternateHadith.grade}</span>
                    </p>
                </InfoBlock>
            )}

          </CardContent>
          <CardFooter>
             <Button asChild variant="default" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/">
                  <ChevronLeft className="w-4 h-4 ml-2" />
                  العودة إلى صفحة البحث الرئيسية
                </Link>
            </Button>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}


interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value?: string | number | null;
  valueClassName?: string;
}

function InfoItem({ icon, label, value, valueClassName }: InfoItemProps) {
  if (!value) return null;
  return (
    <div className="flex items-start space-x-3 space-x-reverse">
      <span className="mt-1">{icon}</span>
      <div>
        <p className="font-medium text-foreground">{label}</p>
        <p className={`text-muted-foreground ${valueClassName || ''}`}>{value}</p>
      </div>
    </div>
  );
}

interface InfoBlockProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

function InfoBlock({ icon, title, children }: InfoBlockProps) {
  return (
    <div className="space-y-2 rounded-lg border bg-card p-4 shadow-sm">
      <div className="flex items-center space-x-3 space-x-reverse">
        {icon}
        <h3 className="font-semibold text-lg text-foreground">{title}</h3>
      </div>
      <div className="pl-8 pr-0">
        {children}
      </div>
    </div>
  );
}
