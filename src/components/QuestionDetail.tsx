
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Plus } from "lucide-react";
import { Question, Answer, useQuestions } from "@/contexts/QuestionContext";
import { toast } from "@/components/ui/use-toast";
import { DialogClose } from "@/components/ui/dialog";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

interface QuestionDetailProps {
  question: Question;
  mode: "view" | "edit";
}

const QuestionDetail: React.FC<QuestionDetailProps> = ({ question, mode }) => {
  const { updateQuestion } = useQuestions();
  const [questionText, setQuestionText] = useState(question.text);
  const [answers, setAnswers] = useState<Answer[]>([...question.answers]);

  useEffect(() => {
    setQuestionText(question.text);
    setAnswers([...question.answers]);
  }, [question]);

  const handleAddAnswer = () => {
    setAnswers([
      ...answers,
      {
        id: `new-${Date.now()}`,
        text: "",
        isCorrect: false,
      },
    ]);
  };

  const handleRemoveAnswer = (id: string) => {
    if (answers.length <= 2) {
      toast({
        title: "Error",
        description: "A question must have at least 2 answers",
        variant: "destructive",
      });
      return;
    }
    setAnswers(answers.filter((a) => a.id !== id));
  };

  const handleAnswerChange = (id: string, text: string) => {
    setAnswers(
      answers.map((a) => (a.id === id ? { ...a, text: text } : a))
    );
  };

  const handleCorrectChange = (id: string, isCorrect: boolean) => {
    setAnswers(
      answers.map((a) => (a.id === id ? { ...a, isCorrect } : a))
    );
  };

  const handleSave = () => {
    // Validate form
    if (!questionText.trim()) {
      toast({
        title: "Error",
        description: "Question text is required",
        variant: "destructive",
      });
      return;
    }

    const emptyAnswers = answers.filter((a) => !a.text.trim());
    if (emptyAnswers.length > 0) {
      toast({
        title: "Error",
        description: "All answers must have text",
        variant: "destructive",
      });
      return;
    }

    if (!answers.some((a) => a.isCorrect)) {
      toast({
        title: "Error",
        description: "At least one answer must be correct",
        variant: "destructive",
      });
      return;
    }

    // Update the question
    updateQuestion({
      id: question.id,
      text: questionText,
      answers: answers,
    });

    toast({
      title: "Success",
      description: "Question updated successfully",
    });
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = [...answers];
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setAnswers(items);
  };

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <Label htmlFor="questionEdit">Question</Label>
        <Input
          id="questionEdit"
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Enter your question"
          readOnly={mode === "view"}
        />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Answers</Label>
          {mode === "edit" && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddAnswer}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Answer
            </Button>
          )}
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="answers">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {answers.map((answer, index) => (
                  <Draggable
                    key={answer.id}
                    draggableId={answer.id}
                    index={index}
                    isDragDisabled={mode === "view"}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="flex items-start space-x-2 p-2 border rounded bg-background"
                      >
                        <Checkbox
                          id={`correct-${answer.id}`}
                          checked={answer.isCorrect}
                          onCheckedChange={(checked) =>
                            handleCorrectChange(
                              answer.id,
                              checked as boolean
                            )
                          }
                          disabled={mode === "view"}
                          className="mt-3"
                        />
                        <div className="flex-1">
                          <Input
                            value={answer.text}
                            onChange={(e) =>
                              handleAnswerChange(answer.id, e.target.value)
                            }
                            placeholder={`Answer ${index + 1}`}
                            readOnly={mode === "view"}
                          />
                        </div>
                        {mode === "edit" && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveAnswer(answer.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <div className="flex justify-end space-x-2">
        <DialogClose asChild>
          <Button variant="outline">
            {mode === "view" ? "Close" : "Cancel"}
          </Button>
        </DialogClose>
        {mode === "edit" && (
          <DialogClose asChild>
            <Button onClick={handleSave}>Save Changes</Button>
          </DialogClose>
        )}
      </div>
    </div>
  );
};

export default QuestionDetail;
