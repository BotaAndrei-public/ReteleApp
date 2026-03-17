
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuestions } from "@/contexts/QuestionContext";
import { Clock, Play, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuizList = () => {
  const { quizzes, deleteQuiz } = useQuestions();
  const navigate = useNavigate();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Your Quizzes ({quizzes.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {quizzes.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No quizzes created yet
            </p>
          ) : (
            quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="p-4 border rounded-md hover:bg-accent transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium">{quiz.name}</p>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <span className="mr-4">{quiz.questions.length} questions</span>
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{quiz.timeLimit} minutes</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                      onClick={() => navigate(`/quiz/${quiz.id}`)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteQuiz(quiz.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizList;
