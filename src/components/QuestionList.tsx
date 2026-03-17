
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuestions, Question } from "@/contexts/QuestionContext";
import { Check, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import QuestionDetail from "./QuestionDetail";

const QuestionList = () => {
  const { questions, deleteQuestion } = useQuestions();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);

  const filteredQuestions = questions.filter((question) =>
    question.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Questions ({questions.length})</CardTitle>
        <div className="mt-2">
          <Input
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {filteredQuestions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {questions.length === 0
                ? "No questions added yet"
                : "No questions match your search"}
            </p>
          ) : (
            filteredQuestions.map((question) => (
              <div
                key={question.id}
                className="p-4 border rounded-md hover:bg-accent transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium">{question.text}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {question.answers.length} answers • {" "}
                      {question.answers.filter((a) => a.isCorrect).length} correct
                    </p>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedQuestion(question)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Edit Question</DialogTitle>
                        </DialogHeader>
                        {selectedQuestion && (
                          <QuestionDetail question={selectedQuestion} mode="edit" />
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteQuestion(question.id)}
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

export default QuestionList;
