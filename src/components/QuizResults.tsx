import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X } from "lucide-react";
import { Question } from '@/contexts/QuestionContext';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

interface QuizResultsProps {
  questions: Question[];
  userAnswers: Record<string, string[]>;
}

const QuizResults = ({ questions, userAnswers }: QuizResultsProps) => {
  const navigate = useNavigate();
  // Detailed logging for debugging
  console.log('Questions:', questions);
  console.log('User Answers:', userAnswers);

  const results = questions.map(question => {
    const userAnswerIds = userAnswers[question.id] || [];
    const correctAnswerIds = question.answers
      .filter(a => a.isCorrect)
      .map(a => a.id);
    
    // Simple and clear scoring logic
    const isCorrect = 
      // All correct answers are selected
      correctAnswerIds.every(id => userAnswerIds.includes(id)) && 
      // No incorrect answers are selected
      userAnswerIds.every(id => 
        question.answers.find(a => a.id === id)?.isCorrect
      );
    
    return { 
      question, 
      isCorrect, 
      userAnswerIds
    };
  });

  const correctCount = results.filter(r => r.isCorrect).length;
  const percentage = Math.round((correctCount / questions.length) * 100);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">Quiz Results</CardTitle>
        <div className="text-center mt-4">
          <p className="text-2xl font-bold mb-2">
            Score: {correctCount}/{questions.length} ({percentage}%)
          </p>
          <p className="text-gray-600">
            {percentage >= 70 ? 'Great job! 🎉' : 'Keep practicing! 💪'}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {results.map(({ 
            question, 
            isCorrect, 
            userAnswerIds
          }, index) => {
            const correctAnswers = question.answers.filter(a => a.isCorrect);

            return (
              <div 
                key={question.id} 
                className={`p-4 border rounded-lg ${
                  isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  ) : (
                    <X className="w-5 h-5 text-red-500 mt-1 flex-shrink-0" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium mb-2">
                      Question {index + 1}: {question.text}
                    </p>
                    {!isCorrect && (
                      <div className="mt-2 space-y-2">
                        <div className="text-sm">
                          <p className="font-medium text-red-600">Your incorrect answers:</p>
                          <ul className="list-disc ml-5 mt-1">
                            {userAnswerIds.map(answerId => {
                              const answer = question.answers.find(a => a.id === answerId);
                              return answer ? (
                                <li key={answerId}>{answer.text}</li>
                              ) : null;
                            })}
                          </ul>
                        </div>
                        <div className="text-sm">
                          <p className="font-medium text-green-600">Correct answers were:</p>
                          <ul className="list-disc ml-5 mt-1">
                            {correctAnswers.map(answer => (
                              <li key={answer.id}>{answer.text}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-8 flex justify-center">
          <Button onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizResults;
