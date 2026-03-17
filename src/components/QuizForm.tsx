import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuestions } from "@/contexts/QuestionContext";
import { toast } from "@/components/ui/use-toast";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import QuestionDetail from "./QuestionDetail";
import { Check, Shuffle } from "lucide-react";
import { Slider } from "@/components/ui/slider";

const QuizForm = () => {
  const { questions, addQuiz } = useQuestions();
  const [quizName, setQuizName] = useState("");
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [timeLimit, setTimeLimit] = useState(30);
  const [searchTerm, setSearchTerm] = useState("");
  const [randomMode, setRandomMode] = useState<'10' | 'all' | '45'>('10');

  const filteredQuestions = questions.filter((question) =>
    question.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleQuestion = (id: string) => {
    if (selectedQuestions.includes(id)) {
      setSelectedQuestions(selectedQuestions.filter((qId) => qId !== id));
    } else {
      setSelectedQuestions([...selectedQuestions, id]);
    }
  };

  const handleRandomSelect = () => {
    if (questions.length === 0) {
      toast({
        title: "Error",
        description: "No questions available to select",
        variant: "destructive",
      });
      return;
    }

    // Shuffle all questions
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    
    let randomSelection: string[];
    let count: number;

    switch (randomMode) {
      case '10':
        count = Math.min(10, questions.length);
        randomSelection = shuffled.slice(0, count).map((q) => q.id);
        break;
      case 'all':
        count = questions.length;
        randomSelection = shuffled.map((q) => q.id);
        break;
      case '45':
        count = Math.min(45, questions.length);
        randomSelection = shuffled.slice(0, count).map((q) => q.id);
        break;
      default:
        count = Math.min(10, questions.length);
        randomSelection = shuffled.slice(0, count).map((q) => q.id);
    }
    
    setSelectedQuestions(randomSelection);
    
    toast({
      title: "Success",
      description: `${count} random questions selected`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!quizName.trim()) {
      toast({
        title: "Error",
        description: "Quiz name is required",
        variant: "destructive",
      });
      return;
    }

    if (selectedQuestions.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one question",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create the quiz
      await addQuiz({
        name: quizName,
        questions: selectedQuestions,
        timeLimit,
      });

      // Reset form
      setQuizName("");
      setSelectedQuestions([]);
      setTimeLimit(30);

      toast({
        title: "Success",
        description: "Quiz created successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create quiz",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create New Quiz</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="quizName">Quiz Name</Label>
            <Input
              id="quizName"
              value={quizName}
              onChange={(e) => setQuizName(e.target.value)}
              placeholder="Enter quiz name"
            />
          </div>

          <div className="space-y-2">
		
            <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
            <div className="flex items-center space-x-4">
              <Slider
                id="timeLimit"
                value={[timeLimit]}
                onValueChange={(value) => setTimeLimit(value[0])}
                min={1}
                max={120}
                step={1}
                className="flex-1"
              />
	<div>
		{/* Modificare - 31/08/2025 - button set 9999 | BUG : PopUP Erroare inutil */}
		<Button className="bg-black hover:bg-gray-600"
		onClick={() => setTimeLimit(99999)} 
		>Time ♾️</Button>
	</div>
              <span className="w-12 text-center">{timeLimit}</span>

            </div>
		
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Select Questions ({selectedQuestions.length} selected)</Label>
              <div className="flex space-x-2">
                <div className="flex items-center space-x-2 mb-4">
                  <Label>Random Selection Mode:</Label>
                  <select 
                    value={randomMode} 
                    onChange={(e) => setRandomMode(e.target.value as '10' | 'all' | '45')}
                    className="border rounded p-2"
                  >
                    <option value="10">10 Questions</option>
                    <option value="all">All Questions</option>
                    <option value="45">45 Questions</option>
                  </select>
                </div>
                <Button type="button" variant="outline" onClick={handleRandomSelect}>
                  <Shuffle className="mr-2 h-4 w-4" /> Random Select
                </Button>
              </div>
            </div>
            
            <div className="border rounded-md p-4">
              <div className="mb-4">
                <Input
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="max-h-[400px] overflow-y-auto pr-2">
                <Accordion type="multiple" className="space-y-2">
                  {filteredQuestions.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                      {questions.length === 0
                        ? "No questions available"
                        : "No questions match your search"}
                    </p>
                  ) : (
                    filteredQuestions.map((question) => (
                      <AccordionItem key={question.id} value={question.id} className="border p-2">
                        <div className="flex items-center">
                          <Checkbox
                            id={`select-${question.id}`}
                            checked={selectedQuestions.includes(question.id)}
                            onCheckedChange={() => handleToggleQuestion(question.id)}
                            className="mr-2"
                          />
                          <AccordionTrigger className="py-2 flex-1 hover:no-underline">
                            <span className="text-left">{question.text}</span>
                          </AccordionTrigger>
                        </div>
                        <AccordionContent>
                          <div className="pt-2 pl-6">
                            <ul className="space-y-1">
                              {question.answers.map((answer) => (
                                <li key={answer.id} className="flex items-center">
                                  {answer.isCorrect && <Check className="h-4 w-4 mr-2 text-green-500" />}
                                  <span className={answer.isCorrect ? "font-medium" : ""}>
                                    {answer.text}
                                  </span>
                                </li>
                              ))}
                            </ul>
                            <div className="mt-2 text-right">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    View Details
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Question Details</DialogTitle>
                                  </DialogHeader>
                                  <QuestionDetail question={question} mode="view" />
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))
                  )}
                </Accordion>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={selectedQuestions.length === 0}>
            Create Quiz
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default QuizForm;
