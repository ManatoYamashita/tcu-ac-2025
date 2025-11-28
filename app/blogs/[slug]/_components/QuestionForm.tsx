'use client';

import { useState } from 'react';
import { ClientQuestion, UserAnswer } from '@/lib/types';
import { validateAnswers } from '@/app/actions/validate-answer';

type Props = {
  slug: string;
  questionSetId: string;
  questions: ClientQuestion[];
};

export default function QuestionForm({ slug, questionSetId, questions }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    // 回答データを構築
    const userAnswers: UserAnswer[] = questions.map((q) => ({
      questionId: q.id,
      answer: answers[q.id] || '',
    }));

    // Server Actionsで検証
    const result = await validateAnswers(slug, questionSetId, userAnswers);

    setMessage(result.message);
    setIsLoading(false);

    if (result.success) {
      // 正解の場合、ページをリロードして記事を表示
      window.location.reload();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">この記事を閲覧するには、以下の質問に答えてください</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {questions.map((q) => (
          <div key={q.id} className="border p-4 rounded-lg">
            <label className="block font-semibold mb-2">{q.text}</label>

            {q.imageUrl && (
              <img src={q.imageUrl} alt="質問画像" className="mb-4 max-w-full h-auto rounded" />
            )}

            {q.type === 'text' && (
              <input
                type="text"
                value={answers[q.id] || ''}
                onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
            )}

            {q.type === 'password' && (
              <input
                type="password"
                value={answers[q.id] || ''}
                onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                className="w-full px-3 py-2 border rounded"
                required
              />
            )}

            {q.type === 'choice' && q.options && (
              <div className="space-y-2">
                {q.options.map((option, idx) => (
                  <label key={idx} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name={q.id}
                      value={option}
                      checked={answers[q.id] === option}
                      onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                      required
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isLoading ? '送信中...' : '回答を送信'}
        </button>

        {message && (
          <p className={`text-center ${message.includes('正解') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
      </form>
      <div className="mt-8">
        <a href="/blogs" className="text-blue-600 hover:underline">
          ← 記事一覧に戻る
        </a>
      </div>
    </div>
  );
}
