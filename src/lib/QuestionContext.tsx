import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "../lib/supabase";

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
  addQuestion: (question: Omit<Question, "id">) => void;
  updateQuestion: (question: Question) => void;
  deleteQuestion: (id: string) => void;
  addQuiz: (quiz: Omit<Quiz, "id">) => void;
  updateQuiz: (quiz: Quiz) => void;
  deleteQuiz: (id: string) => void;
}

const QuestionContext = createContext<QuestionContextType | undefined>(
  undefined
);

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
  const [loading, setLoading] = useState(true);

  // Fetch questions and quizzes from Supabase on component mount
  useEffect(() => {
    fetchQuestions();
    fetchQuizzes();
  }, []);

  const fetchQuestions = async () => {
    try {
      const { data, error } = await supabase.from("questions").select("*");

      if (error) throw error;
      if (data) setQuestions(data);
    } catch (error) {
      console.error("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuizzes = async () => {
    try {
      const { data, error } = await supabase.from("quizzes").select("*");

      if (error) throw error;
      if (data) setQuizzes(data);
    } catch (error) {
      console.error("Error fetching quizzes:", error);
    }
  };

  const addQuestion = async (question: Omit<Question, "id">) => {
    try {
      const { data, error } = await supabase
        .from("questions")
        .insert(question)
        .select();

      if (error) throw error;
      if (data) {
        setQuestions((prev) => [...prev, data[0]]);
      }
    } catch (error) {
      console.error("Error adding question:", error);
    }
  };

  const updateQuestion = async (question: Question) => {
    try {
      const { error } = await supabase
        .from("questions")
        .update(question)
        .eq("id", question.id);

      if (error) throw error;
      setQuestions((prev) =>
        prev.map((q) => (q.id === question.id ? question : q))
      );
    } catch (error) {
      console.error("Error updating question:", error);
    }
  };

  const deleteQuestion = async (id: string) => {
    try {
      const { error } = await supabase.from("questions").delete().eq("id", id);

      if (error) throw error;
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  const addQuiz = async (quiz: Omit<Quiz, "id">) => {
    try {
      const { data, error } = await supabase
        .from("quizzes")
        .insert(quiz)
        .select();

      if (error) throw error;
      if (data) {
        setQuizzes((prev) => [...prev, data[0]]);
      }
    } catch (error) {
      console.error("Error adding quiz:", error);
    }
  };

  const updateQuiz = async (quiz: Quiz) => {
    try {
      const { error } = await supabase
        .from("quizzes")
        .update(quiz)
        .eq("id", quiz.id);

      if (error) throw error;
      setQuizzes((prev) => prev.map((q) => (q.id === quiz.id ? quiz : q)));
    } catch (error) {
      console.error("Error updating quiz:", error);
    }
  };

  const deleteQuiz = async (id: string) => {
    try {
      const { error } = await supabase.from("quizzes").delete().eq("id", id);

      if (error) throw error;
      setQuizzes((prev) => prev.filter((q) => q.id !== id));
    } catch (error) {
      console.error("Error deleting quiz:", error);
    }
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
