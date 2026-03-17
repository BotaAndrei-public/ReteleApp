import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuestions, Question } from "@/contexts/QuestionContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Clock } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

// Single-file: QuizSession + QuizResults (paste into QuizSession.tsx)

const QuizSession: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const { quizzes, questions } = useQuestions();

  const [quiz, setQuiz] = useState(() => quizzes.find((q) => q.id === quizId));

  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string[]>>({});
  const [skippedQuestions, setSkippedQuestions] = useState<string[]>([]);
  const [revisitQuestions, setRevisitQuestions] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showPartialResults, setShowPartialResults] = useState(false);
  const [partialQuestions, setPartialQuestions] = useState<Question[]>([]);
  const [showFinishDialog, setShowFinishDialog] = useState(false);
  const [questionStatus, setQuestionStatus] = useState<
    { id: string; index: number; answered: boolean; skipped: boolean }[]
  >([]);

  // expose debug setter after setTimeLeft exists
  useEffect(() => {
    (window as any).setTimeLeftDebug = (val: number) => setTimeLeft(val);
  }, [setTimeLeft]);

  useEffect(() => {
    if (!quiz) {
      navigate("/");
      return;
    }

    const selectedQuestions = quiz.questions
      .map((id) => questions.find((q) => q.id === id))
      .filter((q): q is Question => q !== undefined);

    const shuffledQuestions = [...selectedQuestions].sort(() => 0.5 - Math.random());
    setQuizQuestions(shuffledQuestions);

    const initialQuestionStatus = shuffledQuestions.map((q, index) => ({
      id: q.id,
      index,
      answered: false,
      skipped: false,
    }));
    setQuestionStatus(initialQuestionStatus);

    setTimeLeft(quiz.timeLimit * 60);
  }, [quiz, questions, navigate]);

  useEffect(() => {
    if (!quiz || timeLeft <= 0 || showResults) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setShowResults(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [quiz, timeLeft, showResults]);

  const handleAnswerToggle = (answerId: string) => {
    const currentQuestion = quizQuestions[currentQuestionIndex];
    if (!currentQuestion) return;
    setUserAnswers((prev) => {
      const cur = prev[currentQuestion.id] || [];
      const isSelected = cur.includes(answerId);
      const next = isSelected ? cur.filter((id) => id !== answerId) : [...cur, answerId];
      return { ...prev, [currentQuestion.id]: next };
    });
  };

  const handleNext = () => {
    const currentQuestion = quizQuestions[currentQuestionIndex];
    if (!currentQuestion) return;

    if (!userAnswers[currentQuestion.id] || userAnswers[currentQuestion.id].length === 0) {
      toast({
        title: "Answer Required",
        description: "Please select at least one answer before moving to the next question.",
        variant: "destructive",
      });
      return;
    }

    setQuestionStatus((prev) =>
      prev.map((s) => (s.id === currentQuestion.id ? { ...s, answered: true, skipped: false } : s))
    );

    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    } else {
      setShowFinishDialog(true);
    }
  };

  const handleFinishQuiz = () => {
    const allAnswered = quizQuestions.every((q) => userAnswers[q.id] && userAnswers[q.id].length > 0);
    if (!allAnswered) {
      toast({
        title: "Incomplete Quiz",
        description: "Please answer all questions before finishing.",
        variant: "destructive",
      });
      return;
    }
    setShowResults(true);
  };

  const handleSkip = () => {
    const currentQuestion = quizQuestions[currentQuestionIndex];
    if (!currentQuestion) return;
    setQuestionStatus((prev) => prev.map((s) => (s.id === currentQuestion.id ? { ...s, skipped: true } : s)));
    setSkippedQuestions((p) => [...p, currentQuestion.id]);
    setRevisitQuestions((p) => [...p, currentQuestion.id]);
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    } else {
      setShowFinishDialog(true);
    }
  };

  const handleRevisitSkipped = (questionId: string) => {
    const idx = quizQuestions.findIndex((q) => q.id === questionId);
    if (idx !== -1) {
      setCurrentQuestionIndex(idx);
      setRevisitQuestions((p) => p.filter((id) => id !== questionId));
    }
  };

  const handleCheckSoFar = () => {
    const answeredSoFar = quizQuestions.slice(0, currentQuestionIndex);
    if (answeredSoFar.length === 0) {
      toast({
        title: "Nimic de verificat",
        description: "Nu ai răspuns încă la nicio întrebare.",
        variant: "destructive",
      });
      return;
    }
    setPartialQuestions(answeredSoFar);
    setShowPartialResults(true);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Amestecă răspunsurile pentru întrebarea curentă.
  // Se recalculează doar când se schimbă întrebarea (currentQuestionIndex),
  // deci ordinea rămâne stabilă cât timp ești pe aceeași întrebare.
  const currentQuestion = quizQuestions[currentQuestionIndex];

  const shuffledAnswers = useMemo(() => {
    if (!currentQuestion) return [];
    return [...currentQuestion.answers].sort(() => Math.random() - 0.5);
  }, [currentQuestion?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!quiz || quizQuestions.length === 0) {
    return <div>Loading...</div>;
  }

  if (showResults || showPartialResults) {
    return (
      <div className="container mx-auto py-8 px-4">
        <QuizResults
          questions={showPartialResults ? partialQuestions : quizQuestions}
          userAnswers={userAnswers}
          onBack={() => setShowPartialResults(false)}
          isPartial={showPartialResults}
        />
      </div>
    );
  }

  const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <CardTitle>
              Question {currentQuestionIndex + 1} of {quizQuestions.length}
            </CardTitle>
            <div className="flex items-center gap-2 text-orange-500">
              <Clock className="w-5 h-5" />
              <span className="font-medium">{formatTime(timeLeft)}</span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>

        <CardContent className="pt-6">
          <p className="text-lg mb-6">{currentQuestion.text}</p>
          <div className="space-y-4">
            {shuffledAnswers.map((answer) => (
              <div key={answer.id} className="flex items-center space-x-2">
                <Checkbox
                  id={answer.id}
                  checked={userAnswers[currentQuestion.id]?.includes(answer.id) || false}
                  onCheckedChange={() => handleAnswerToggle(answer.id)}
                />
                <Label htmlFor={answer.id} className="text-sm font-medium leading-none">
                  {answer.text}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="flex justify-between w-full gap-4">
            <Button variant="outline" className="flex-1" onClick={handleSkip} disabled={currentQuestionIndex >= quizQuestions.length - 1}>
              Skip Question
            </Button>
            <Button className="flex-1" onClick={handleNext}>
              {currentQuestionIndex < quizQuestions.length - 1 ? "Next Question" : "Finish Quiz"}
            </Button>
          </div>

          <Button variant="secondary" className="w-full" onClick={handleCheckSoFar}>
            Verifică până acum ({currentQuestionIndex} / {quizQuestions.length})
          </Button>

          <div className="w-full bg-gray-100 p-4 rounded-lg">
            <Label className="mb-3 block text-sm font-semibold text-gray-700">Question Navigation:</Label>
            <div className="flex flex-wrap gap-2">
              {quizQuestions.map((question, index) => {
                const status = questionStatus.find((s) => s.id === question.id);
                return (
                  <Button
                    key={question.id}
                    size="sm"
                    variant={currentQuestionIndex === index ? "default" : "outline"}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`${status?.answered ? "bg-green-100 hover:bg-green-200" : ""} ${status?.skipped ? "bg-yellow-100 hover:bg-yellow-200" : ""} ${currentQuestionIndex === index ? "bg-blue-500 text-white" : ""}`}
                  >
                    {index + 1}
                  </Button>
                );
              })}
            </div>
          </div>

          {revisitQuestions.length > 0 && (
            <div className="w-full bg-gray-100 p-4 rounded-lg">
              <Label className="mb-3 block text-sm font-semibold text-gray-700">Skipped Questions:</Label>
              <div className="flex flex-wrap gap-2">
                {revisitQuestions.map((questionId) => (
                  <Button key={questionId} size="sm" variant="outline" onClick={() => handleRevisitSkipped(questionId)} className="hover:bg-gray-200">
                    Question {quizQuestions.findIndex((q) => q.id === questionId) + 1}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardFooter>

        <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Finish Quiz</DialogTitle>
              <DialogDescription>Are you sure you want to finish the quiz? You can still review and change your answers.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowFinishDialog(false)}>
                Continue Quiz
              </Button>
              <Button onClick={handleFinishQuiz}>Finish Quiz</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
};

export default QuizSession;

/* ---------------- QuizResults component ---------------- */

interface QuizResultsProps {
  questions: Question[];
  userAnswers: Record<string, string[]>;
  onBack?: () => void;
  isPartial?: boolean;
}

export const QuizResults: React.FC<QuizResultsProps> = ({ questions, userAnswers, onBack, isPartial }) => {
  const getCorrectIds = (q: Question): string[] => {
    // common shapes
    // @ts-ignore
    if (Array.isArray(q.correctAnswers) && q.correctAnswers.length) return q.correctAnswers;
    // @ts-ignore
    if (Array.isArray(q.correctAnswerIds) && q.correctAnswerIds.length) return q.correctAnswerIds;
    // @ts-ignore
    if (typeof (q as any).correctAnswer === "string") return [(q as any).correctAnswer];

    const ids: string[] = [];
    q.answers.forEach((a: any) => {
      if (a.correct === true || a.isCorrect === true || a.is_correct === true) ids.push(a.id);
    });
    return ids;
  };

  const metadata = questions.map((q) => {
    const correctIds = new Set(getCorrectIds(q));
    const userSel = new Set(userAnswers[q.id] || []);
    const canJudge = correctIds.size > 0;
    const isExactMatch = canJudge && correctIds.size === userSel.size && [...correctIds].every((x) => userSel.has(x));
    return { q, correctIds, userSel, canJudge, isExactMatch };
  });

  const knownCount = metadata.filter((m) => m.canJudge).length;
  const correctCount = metadata.filter((m) => m.isExactMatch).length;

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{isPartial ? "Rezultat parțial" : "Rezultat final"}</CardTitle>
              <div className="text-sm text-gray-600">Întrebări evaluate: {questions.length}</div>
            </div>
            <div className="text-right">
              {knownCount > 0 ? <div className="text-lg font-semibold">Scor: {correctCount} / {knownCount}</div> : <div className="text-sm text-gray-500">Nu pot calcula scor (nu există informație despre răspunsul corect)</div>}
              {onBack && (
                <div className="mt-2">
                  <Button variant="outline" onClick={onBack}>⬅ Înapoi la quiz</Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {metadata.map((m, idx) => {
              const { q, correctIds, userSel, canJudge, isExactMatch } = m;
              return (
                <div key={q.id} className="p-4 border rounded">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium">{idx + 1}. {q.text}</div>
                    <div className="text-sm">
                      {canJudge ? (
                        <span className={`px-2 py-1 rounded text-sm font-semibold ${isExactMatch ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {isExactMatch ? "Corect" : "Greșit"}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-sm text-gray-600 bg-gray-100">N/A</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {q.answers.map((a) => {
                      const id = a.id;
                      const isUser = userSel.has(id);
                      const isCorrect = correctIds.has(id);

                      const base = "p-2 rounded border flex items-center justify-between";
                      const classes = isCorrect ? `${base} border-green-300 bg-green-50` : isUser && !isCorrect ? `${base} border-red-300 bg-red-50` : `${base} border-gray-200`;

                      return (
                        <div key={id} className={classes}>
                          <div className="flex items-center gap-3">
                            <div className="font-medium text-sm">{a.text}</div>
                            {isUser && <div className="text-sm text-gray-700">(Alegerea ta)</div>}
                          </div>
                          <div className="text-sm">
                            {isCorrect && <span className="text-green-700 font-semibold">Corect</span>}
                            {!isCorrect && isUser && <span className="text-red-700 font-semibold">Greșit</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
