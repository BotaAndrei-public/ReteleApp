import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

export interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  text: string;
  answers: Answer[];
}

export interface Quiz {
  id: string;
  name: string;
  questions: string[]; // Array of question IDs
  timeLimit: number; // Time limit in minutes
}

interface QuestionContextType {
  questions: Question[];
  quizzes: Quiz[];
  addQuestion: (question: Omit<Question, "id">) => Promise<void>;
  updateQuestion: (question: Question) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  addQuiz: (quiz: Omit<Quiz, "id">) => Promise<void>;
  updateQuiz: (quiz: Quiz) => Promise<void>;
  deleteQuiz: (id: string) => Promise<void>;
}

const QuestionContext = createContext<QuestionContextType | undefined>(undefined);

export const useQuestions = () => {
  const context = useContext(QuestionContext);
  if (!context) {
    throw new Error("useQuestions must be used within a QuestionProvider");
  }
  return context;
};

export const QuestionProvider = ({ children }: { children: ReactNode }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);

  // Load questions and quizzes from Supabase on mount
  useEffect(() => {
    loadQuestions();
    loadQuizzes();
  }, []);

  const loadQuestions = async () => {
    const { data, error } = await supabase
      .from('questions')
      .select('*');
    
    if (error) {
      console.error('Error loading questions:', error);
      return;
    }

    setQuestions(data || []);
  };

  const loadQuizzes = async () => {
    const { data, error } = await supabase
      .from('quizzes')
      .select('*');
    
    if (error) {
      console.error('Error loading quizzes:', error);
      return;
    }

    // Convert snake_case to camelCase
    const formattedQuizzes = (data || []).map(quiz => ({
      id: quiz.id,
      name: quiz.name,
      questions: quiz.questions,
      timeLimit: quiz.time_limit
    }));

    setQuizzes(formattedQuizzes);
  };

  const addQuestion = async (question: Omit<Question, "id">) => {
    const newQuestion = {
      ...question,
      id: Date.now().toString(),
    };

    const { error } = await supabase
      .from('questions')
      .insert([newQuestion]);

    if (error) {
      console.error('Error adding question:', error);
      return;
    }

    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = async (question: Question) => {
    const { error } = await supabase
      .from('questions')
      .update(question)
      .eq('id', question.id);

    if (error) {
      console.error('Error updating question:', error);
      return;
    }

    setQuestions(questions.map(q => q.id === question.id ? question : q));
  };

  const deleteQuestion = async (id: string) => {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting question:', error);
      return;
    }

    setQuestions(questions.filter(q => q.id !== id));
  };

  const addQuiz = async (quiz: Omit<Quiz, "id">) => {
    const newQuiz = {
      ...quiz,
      id: Date.now().toString(),
      time_limit: quiz.timeLimit, // Convert to snake_case for Supabase
    };

    const { error } = await supabase
      .from('quizzes')
      .insert([{
        id: newQuiz.id,
        name: newQuiz.name,
        questions: newQuiz.questions,
        time_limit: newQuiz.time_limit
      }]);

    if (error) {
      console.error('Error adding quiz:', error);
      throw error;
    }

    setQuizzes([...quizzes, { ...newQuiz, timeLimit: newQuiz.time_limit }]);
  };

  const updateQuiz = async (quiz: Quiz) => {
    const { error } = await supabase
      .from('quizzes')
      .update({
        name: quiz.name,
        questions: quiz.questions,
        time_limit: quiz.timeLimit
      })
      .eq('id', quiz.id);

    if (error) {
      console.error('Error updating quiz:', error);
      throw error;
    }

    setQuizzes(quizzes.map(q => q.id === quiz.id ? quiz : q));
  };

  const deleteQuiz = async (id: string) => {
    const { error } = await supabase
      .from('quizzes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting quiz:', error);
      return;
    }

    setQuizzes(quizzes.filter(q => q.id !== id));
  };

  return (
    <QuestionContext.Provider
      value={{
        questions,
        quizzes,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        addQuiz,
        updateQuiz,
        deleteQuiz,
      }}
    >
      {children}
    </QuestionContext.Provider>
  );
};
