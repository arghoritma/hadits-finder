
'use client';

import type { Hadith } from '@/services/dorar-api';
import { analyzeHadith, type AnalyzeHadithOutput, type AnalyzeHadithInput } from '@/ai/flows/analyze-hadith-flow';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Sparkles, BookOpenText, Network, MessageSquareQuote, AlertCircle } from 'lucide-react';
import React, { useState } from 'react';

interface HadithAiAnalysisProps {
  hadithData: Pick<Hadith, 'hadith' | 'rawi' | 'mohdith' | 'book' | 'grade' | 'explainGrade'>;
}

export default function HadithAiAnalysis({ hadithData }: HadithAiAnalysisProps) {
  const [analysis, setAnalysis] = useState<AnalyzeHadithOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const input: AnalyzeHadithInput = {
        hadithText: hadithData.hadith,
        rawi: hadithData.rawi,
        mohdith: hadithData.mohdith,
        book: hadithData.book,
        grade: hadithData.grade,
        explainGrade: hadithData.explainGrade,
      };
      const result = await analyzeHadith(input);
      setAnalysis(result);
    } catch (err) {
      console.error('AI Analysis Error:', err);
      setError('حدث خطأ أثناء تحليل الحديث بواسطة الذكاء الاصطناعي. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg mt-6 bg-card text-card-foreground border-accent/50">
      <CardHeader className="border-b border-accent/30 pb-4">
        <CardTitle className="text-xl flex items-center text-accent">
          <Sparkles className="w-6 h-6 ml-2" />
          تحليل الحديث بالذكاء الاصطناعي
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {!analysis && !isLoading && (
          <div className="text-center">
            <p className="mb-4 text-muted-foreground">
              اضغط على الزر أدناه لبدء تحليل هذا الحديث من حيث الدراية والرواية وأسباب الورود باستخدام الذكاء الاصطناعي.
            </p>
            <Button onClick={handleAnalyze} disabled={isLoading} className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {isLoading ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري التحليل...
                </>
              ) : (
                <>
                  <Sparkles className="ml-2 h-4 w-4" />
                  ابدأ التحليل
                </>
              )}
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center items-center py-6">
            <Loader2 className="h-8 w-8 text-accent animate-spin" />
            <p className="ml-3 text-lg text-muted-foreground">يقوم الذكاء الاصطناعي بتحليل الحديث...</p>
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>خطأ في التحليل</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {analysis && !isLoading && (
          <Accordion type="single" collapsible defaultValue="item-1" className="w-full space-y-3">
            <AnalysisAccordionItem
              value="item-1"
              icon={<BookOpenText className="w-5 h-5 text-accent" />}
              title="تحليل الدراية (المتن والمعنى)"
              content={analysis.dirayahAnalysis}
            />
            <AnalysisAccordionItem
              value="item-2"
              icon={<Network className="w-5 h-5 text-accent" />}
              title="تحليل الرواية (السند والصحة)"
              content={analysis.riwayahAnalysis}
            />
            <AnalysisAccordionItem
              value="item-3"
              icon={<MessageSquareQuote className="w-5 h-5 text-accent" />}
              title="أسباب الورود (سياق الحديث)"
              content={analysis.asbabAlWurudAnalysis}
            />
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}

interface AnalysisAccordionItemProps {
    value: string;
    icon: React.ReactNode;
    title: string;
    content: string;
}

function AnalysisAccordionItem({ value, icon, title, content }: AnalysisAccordionItemProps) {
    return (
        <AccordionItem value={value} className="bg-background/50 border border-border rounded-lg shadow-sm">
            <AccordionTrigger className="px-4 py-3 text-lg font-semibold hover:no-underline text-foreground">
                <div className="flex items-center">
                    {icon}
                    <span className="mr-3">{title}</span>
                </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 pt-2 text-muted-foreground prose prose-sm max-w-none">
                 <div dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }} />
            </AccordionContent>
        </AccordionItem>
    );
}
