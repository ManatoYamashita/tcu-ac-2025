'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ClientQuestion, UserAnswer } from '@/lib/types';
import { validateAnswers } from '@/app/actions/validate-answer';
import { createQuestionFormSchema, QuestionFormValues } from '@/lib/schemas/question-form';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

type Props = {
  slug: string;
  questionSetId: string;
  questions: ClientQuestion[];
};

export default function QuestionForm({ slug, questionSetId, questions }: Props) {
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const questionIds = questions.map((q) => q.id);
  const schema = createQuestionFormSchema(questionIds);

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(schema),
    defaultValues: questionIds.reduce((acc, id) => ({ ...acc, [id]: '' }), {}),
  });

  const onSubmit = async (data: QuestionFormValues) => {
    setMessage('');
    setIsSuccess(false);

    // 回答データを構築
    const userAnswers: UserAnswer[] = questions.map((q) => ({
      questionId: q.id,
      answer: data[q.id] || '',
    }));

    // Server Actionsで検証
    const result = await validateAnswers(slug, questionSetId, userAnswers);

    setMessage(result.message);
    setIsSuccess(result.success);

    if (result.success) {
      // 正解の場合、ページをリロードして記事を表示
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 container py-6 lg:py-10">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>認証が必要です</CardTitle>
              <CardDescription>
                この記事を閲覧するには、以下の質問に答えてください
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {questions.map((q) => (
                    <FormField
                      key={q.id}
                      control={form.control}
                      name={q.id}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{q.text}</FormLabel>
                          {q.imageUrl && (
                            <div className="my-4">
                              <img
                                src={q.imageUrl}
                                alt="質問画像"
                                className="max-w-full h-auto rounded-lg border"
                              />
                            </div>
                          )}
                          {q.type === 'text' && (
                            <FormControl>
                              <Input type="text" placeholder="回答を入力してください" {...field} />
                            </FormControl>
                          )}
                          {q.type === 'password' && (
                            <FormControl>
                              <Input type="password" placeholder="パスワードを入力してください" {...field} />
                            </FormControl>
                          )}
                          {q.type === 'choice' && q.options && (
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              {q.options.map((option, idx) => (
                                <FormItem key={idx} className="flex items-center space-x-3 space-y-0">
                                  <FormControl>
                                    <RadioGroupItem value={option} />
                                  </FormControl>
                                  <FormLabel className="font-normal cursor-pointer">
                                    {option}
                                  </FormLabel>
                                </FormItem>
                              ))}
                            </RadioGroup>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}

                  <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? '送信中...' : '回答を送信'}
                  </Button>

                  {message && (
                    <Alert variant={isSuccess ? 'default' : 'destructive'}>
                      {isSuccess ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <AlertCircle className="h-4 w-4" />
                      )}
                      <AlertDescription>{message}</AlertDescription>
                    </Alert>
                  )}
                </form>
              </Form>

              <div className="mt-6">
                <Button variant="ghost" asChild>
                  <Link href="/blogs">← 記事一覧に戻る</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
