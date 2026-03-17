
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QuestionForm from "@/components/QuestionForm";
import QuestionList from "@/components/QuestionList";
import QuizForm from "@/components/QuizForm";
import QuizList from "@/components/QuizList";

const Index = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <img className=" mt-[-25px] w-[100px] h-auto object-contain self-center  mb-[50px]" src="/Retele_Electrice.png" alt="" />
     <div className= "flex items-center justify-center gap-x-4 mb-8 ">
     <h1 className="text-3xl font-bold mb-8 text-center">Retele Electrice Quiz Builder  </h1>
      
     </div>
      
      <Tabs defaultValue="questions" className="max-w-4xl mx-auto">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="questionList">Question List</TabsTrigger>
          <TabsTrigger value="createQuiz">Create Quiz</TabsTrigger>
          <TabsTrigger value="quizzes">My Quizzes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="questions" className="mt-6">
          <QuestionForm />
        </TabsContent>
        
        <TabsContent value="questionList" className="mt-6">
          <QuestionList />
        </TabsContent>
        
        <TabsContent value="createQuiz" className="mt-6">
          <QuizForm />
        </TabsContent>
        
        <TabsContent value="quizzes" className="mt-6">
          <QuizList />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Index;
