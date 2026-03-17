import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuestions } from '@/contexts/QuestionContext';
import { Checkbox } from "@/components/ui/checkbox";
import QuizResults from '@/components/QuizResults';
import { Timer } from 'lucide-react';

const Quiz = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { quizzes, questions } = useQuestions();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string[]>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const quiz = quizzes.find(q => q.id === id);
  const quizQuestions = quiz ? questions.filter(q => quiz.questions.includes(q.id)) : [];
  const currentQuestion = quizQuestions[currentQuestionIndex];

  useEffect(() => {
    if (!quiz) {
      navigate('/');
      return;
    }
    setTimeLeft(quiz.timeLimit * 60);
  }, [quiz, navigate]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setIsFinished(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAnswerToggle = (answerId: string) => {
    if (!currentQuestion) return;

    setUserAnswers(prev => {
      const currentAnswers = prev[currentQuestion.id] || [];
      const newAnswers = currentAnswers.includes(answerId)
        ? currentAnswers.filter(id => id !== answerId)
        : [...currentAnswers, answerId];
      
      return {
        ...prev,
        [currentQuestion.id]: newAnswers
      };
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!quiz || !currentQuestion) {
    return <div>Loading...</div>;
  }

  if (isFinished) {
    return <QuizResults questions={quizQuestions} userAnswers={userAnswers} />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Question {currentQuestionIndex + 1} of {quizQuestions.length}</CardTitle>
            <div className="flex items-center gap-2 text-orange-500">
              <Timer className="w-5 h-5" />
              <span className="font-medium">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-lg mb-6">{currentQuestion.text}</p>
          <div className="space-y-4">
            {currentQuestion.answers.map((answer) => (
              <div key={answer.id} className="flex items-center space-x-2">
                <Checkbox
                  id={answer.id}
                  checked={userAnswers[currentQuestion.id]?.includes(answer.id)}
                  onCheckedChange={() => handleAnswerToggle(answer.id)}
                />
                <label
                  htmlFor={answer.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {answer.text}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleNext}>
            {currentQuestionIndex < quizQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Quiz;
