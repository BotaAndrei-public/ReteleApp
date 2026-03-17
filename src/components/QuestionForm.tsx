import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus } from "lucide-react";
import { useQuestions, Answer } from "@/contexts/QuestionContext";
import { toast } from "@/components/ui/use-toast";

const QuestionForm = () => {
  const { addQuestion } = useQuestions();
  const [questionText, setQuestionText] = useState("");
  const [answers, setAnswers] = useState<Omit<Answer, "id">[]>([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);

  const handleAddAnswer = () => {
    setAnswers([...answers, { text: "", isCorrect: false }]);
  };

  const handleRemoveAnswer = (index: number) => {
    if (answers.length <= 2) {
      toast({
        title: "Error",
        description: "A question must have at least 2 answers",
        variant: "destructive",
      });
      return;
    }
    const newAnswers = [...answers];
    newAnswers.splice(index, 1);
    setAnswers(newAnswers);
  };

  const handleAnswerChange = (index: number, text: string) => {
    const newAnswers = [...answers];
    newAnswers[index].text = text;
    setAnswers(newAnswers);
  };

  const handleCorrectChange = (index: number, isCorrect: boolean) => {
    const newAnswers = [...answers];
    newAnswers[index].isCorrect = isCorrect;
    setAnswers(newAnswers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!questionText.trim()) {
      toast({
        title: "Error",
        description: "Question text is required",
        variant: "destructive",
      });
      return;
    }

    const emptyAnswers = answers.filter(a => !a.text.trim());
    if (emptyAnswers.length > 0) {
      toast({
        title: "Error",
        description: "All answers must have text",
        variant: "destructive",
      });
      return;
    }

    if (!answers.some(a => a.isCorrect)) {
      toast({
        title: "Error",
        description: "At least one answer must be correct",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create the question
      await addQuestion({
        text: questionText,
        answers: answers.map((a, index) => ({
          ...a,
          id: index.toString(),
        })),
      });

      // Reset form
      setQuestionText("");
      setAnswers([
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ]);

      toast({
        title: "Success",
        description: "Question added successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add question",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Add New Question</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="question">Question</Label>
            <Input
              id="question"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Enter your question"
            />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Answers</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleAddAnswer}>
                <Plus className="h-4 w-4 mr-2" />
                Add Answer
              </Button>
            </div>
            
            {answers.map((answer, index) => (
              <div key={index} className="flex items-start space-x-2">
                <Checkbox
                  id={`correct-${index}`}
                  checked={answer.isCorrect}
                  onCheckedChange={(checked) => 
                    handleCorrectChange(index, checked as boolean)
                  }
                  className="mt-3"
                />
                <div className="flex-1">
                  <Label htmlFor={`answer-${index}`} className="sr-only">
                    Answer {index + 1}
                  </Label>
                  <Input
                    id={`answer-${index}`}
                    value={answer.text}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    placeholder={`Answer ${index + 1}`}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveAnswer(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit">Save Question</Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default QuestionForm;
