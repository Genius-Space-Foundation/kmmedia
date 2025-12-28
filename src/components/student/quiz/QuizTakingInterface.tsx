"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  Save,
  Eye,
} from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: string;
  text: string;
  type: "MULTIPLE_CHOICE" | "MULTIPLE_SELECT" | "TRUE_FALSE" | "SHORT_ANSWER" | "ESSAY";
  options: string[];
  points: number;
  order: number;
}

interface Assessment {
  id: string;
  title: string;
  description: string;
  type: string;
  totalPoints: number;
  passingScore: number;
  timeLimit: number; // in minutes
  attempts: number;
  questions: Question[];
}

interface QuizTakingInterfaceProps {
  assessment: Assessment;
  onSubmit: (answers: Map<string, any>, timeSpent: number) => Promise<void>;
  onSaveDraft: (answers: Map<string, any>) => Promise<void>;
  onClose: () => void;
}

export default function QuizTakingInterface({
  assessment,
  onSubmit,
  onSaveDraft,
  onClose,
}: QuizTakingInterfaceProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, any>>(new Map());
  const [timeRemaining, setTimeRemaining] = useState(assessment.timeLimit * 60); // Convert to seconds
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [showReviewMode, setShowReviewMode] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [startTime] = useState(new Date());

  const currentQuestion = assessment.questions[currentQuestionIndex];
  const totalQuestions = assessment.questions.length;
  const answeredCount = answers.size;
  const progress = (answeredCount / totalQuestions) * 100;

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0) {
      handleAutoSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Auto-save every 30 seconds
  useEffect(() => {
    const autoSaveInterval = setInterval(async () => {
      if (answers.size > 0) {
        await handleSaveDraft();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [answers]);

  const handleAutoSubmit = async () => {
    toast.warning("Time's up! Submitting your quiz automatically...");
    const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000 / 60);
    await onSubmit(answers, timeSpent);
  };

  const handleSaveDraft = async () => {
    try {
      await onSaveDraft(answers);
      setLastSaved(new Date());
      toast.success("Draft saved successfully");
    } catch (error) {
      toast.error("Failed to save draft");
    }
  };

  const handleAnswerChange = (questionId: string, answer: any) => {
    const newAnswers = new Map(answers);
    newAnswers.set(questionId, answer);
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleJumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    setShowReviewMode(false);
  };

  const handleSubmitClick = () => {
    if (answeredCount < totalQuestions) {
      setShowSubmitDialog(true);
    } else {
      handleFinalSubmit();
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000 / 60);
      await onSubmit(answers, timeSpent);
      toast.success("Quiz submitted successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to submit quiz");
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const renderQuestionInput = () => {
    const currentAnswer = answers.get(currentQuestion.id);

    switch (currentQuestion.type) {
      case "MULTIPLE_CHOICE":
      case "TRUE_FALSE":
        return (
          <RadioGroup
            value={currentAnswer || ""}
            onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
          >
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label
                    htmlFor={`option-${index}`}
                    className="flex-1 cursor-pointer text-base"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        );

      case "MULTIPLE_SELECT":
        const selectedOptions = currentAnswer || [];
        return (
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-4 border-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Checkbox
                  id={`option-${index}`}
                  checked={selectedOptions.includes(option)}
                  onCheckedChange={(checked) => {
                    const newSelected = checked
                      ? [...selectedOptions, option]
                      : selectedOptions.filter((o: string) => o !== option);
                    handleAnswerChange(currentQuestion.id, newSelected);
                  }}
                />
                <Label
                  htmlFor={`option-${index}`}
                  className="flex-1 cursor-pointer text-base"
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case "SHORT_ANSWER":
        return (
          <Textarea
            value={currentAnswer || ""}
            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            placeholder="Type your answer here..."
            rows={3}
            className="border-2 text-base"
          />
        );

      case "ESSAY":
        return (
          <Textarea
            value={currentAnswer || ""}
            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
            placeholder="Write your essay answer here..."
            rows={10}
            className="border-2 text-base font-mono"
          />
        );

      default:
        return null;
    }
  };

  if (showReviewMode) {
    return (
      <div className="space-y-6">
        <Card className="border-2">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center justify-between">
              <span>Review Your Answers</span>
              <Button variant="outline" onClick={() => setShowReviewMode(false)}>
                Back to Quiz
              </Button>
            </CardTitle>
            <CardDescription>
              Review all questions before submitting. Click on any question to edit your answer.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assessment.questions.map((question, index) => {
                const isAnswered = answers.has(question.id);
                return (
                  <Card
                    key={question.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isAnswered ? "border-green-300 bg-green-50/50" : "border-orange-300 bg-orange-50/50"
                    }`}
                    onClick={() => handleJumpToQuestion(index)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-gray-700">
                            Question {index + 1}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                            {question.text}
                          </p>
                        </div>
                        {isAnswered ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
          <CardFooter className="bg-gray-50 flex justify-between">
            <div className="text-sm text-gray-600">
              {answeredCount} of {totalQuestions} questions answered
            </div>
            <Button
              onClick={handleSubmitClick}
              className="bg-brand-primary hover:bg-brand-secondary"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Quiz
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Timer and Progress */}
      <Card className="border-2 border-brand-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{assessment.title}</h2>
              <p className="text-gray-600 mt-1">{assessment.description}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <Clock className={`w-5 h-5 ${timeRemaining < 300 ? "text-red-600" : "text-gray-600"}`} />
                  <span className={`text-2xl font-bold ${timeRemaining < 300 ? "text-red-600" : "text-gray-900"}`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Time Remaining</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
              <span className="text-gray-600">
                {answeredCount} answered
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {lastSaved && (
            <p className="text-xs text-gray-500 mt-2">
              Last saved: {lastSaved.toLocaleTimeString()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Question Card */}
      <Card className="border-2">
        <CardHeader className="bg-gray-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl">
                Question {currentQuestionIndex + 1}
              </CardTitle>
              <CardDescription className="mt-2 text-base leading-relaxed">
                {currentQuestion.text}
              </CardDescription>
            </div>
            <Badge variant="outline" className="ml-4">
              {currentQuestion.points} {currentQuestion.points === 1 ? "point" : "points"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {renderQuestionInput()}
        </CardContent>
        <CardFooter className="bg-gray-50 flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowReviewMode(true)}>
              <Eye className="w-4 h-4 mr-2" />
              Review All
            </Button>
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
          </div>

          {currentQuestionIndex < totalQuestions - 1 ? (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmitClick}
              className="bg-brand-primary hover:bg-brand-secondary"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Quiz
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Quiz?</DialogTitle>
            <DialogDescription>
              You have answered {answeredCount} out of {totalQuestions} questions.
              {answeredCount < totalQuestions && (
                <span className="block mt-2 text-orange-600 font-semibold">
                  {totalQuestions - answeredCount} question(s) remain unanswered.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Continue Quiz
            </Button>
            <Button
              onClick={handleFinalSubmit}
              disabled={isSubmitting}
              className="bg-brand-primary hover:bg-brand-secondary"
            >
              {isSubmitting ? "Submitting..." : "Submit Anyway"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
