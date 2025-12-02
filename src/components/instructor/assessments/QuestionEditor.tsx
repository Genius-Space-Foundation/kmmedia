"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, GripVertical, Check } from "lucide-react";

export interface Question {
  id: string;
  text: string;
  type: "MULTIPLE_CHOICE" | "MULTIPLE_SELECT" | "TRUE_FALSE" | "SHORT_ANSWER" | "ESSAY";
  points: number;
  options?: string[];
  correctAnswer?: string | string[];
  explanation?: string;
  order: number;
}

interface QuestionEditorProps {
  questions: Question[];
  onChange: (questions: Question[]) => void;
}

export default function QuestionEditor({ questions, onChange }: QuestionEditorProps) {
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: "",
      type: "MULTIPLE_CHOICE",
      points: 10,
      options: ["Option 1", "Option 2", "Option 3", "Option 4"],
      correctAnswer: "Option 1",
      order: questions.length + 1,
    };
    onChange([...questions, newQuestion]);
    setActiveQuestion(newQuestion.id);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    onChange(
      questions.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  const removeQuestion = (id: string) => {
    onChange(questions.filter((q) => q.id !== id));
    if (activeQuestion === id) setActiveQuestion(null);
  };

  const handleOptionChange = (questionId: string, optionIndex: number, value: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question || !question.options) return;

    const newOptions = [...question.options];
    newOptions[optionIndex] = value;
    updateQuestion(questionId, { options: newOptions });
    
    // If this option was the correct answer, update it too (simple logic)
    if (question.correctAnswer === question.options[optionIndex]) {
        updateQuestion(questionId, { correctAnswer: value });
    }
  };

  const addOption = (questionId: string) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question || !question.options) return;
    updateQuestion(questionId, { options: [...question.options, `Option ${question.options.length + 1}`] });
  };

  const removeOption = (questionId: string, index: number) => {
      const question = questions.find((q) => q.id === questionId);
      if (!question || !question.options) return;
      updateQuestion(questionId, { options: question.options.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Questions ({questions.length})</h3>
        <Button onClick={addQuestion} size="sm" className="bg-brand-primary text-white">
          <Plus className="h-4 w-4 mr-2" /> Add Question
        </Button>
      </div>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <Card key={question.id} className={`border ${activeQuestion === question.id ? 'border-brand-primary ring-1 ring-brand-primary' : 'border-neutral-200'}`}>
            <CardHeader className="p-4 bg-neutral-50 flex flex-row items-center justify-between cursor-pointer" onClick={() => setActiveQuestion(activeQuestion === question.id ? null : question.id)}>
              <div className="flex items-center gap-3">
                <GripVertical className="h-4 w-4 text-neutral-400" />
                <span className="font-medium">Q{index + 1}.</span>
                <span className="text-sm text-neutral-600 truncate max-w-[300px]">{question.text || "New Question"}</span>
                <span className="text-xs bg-neutral-200 px-2 py-1 rounded text-neutral-600">{question.type.replace("_", " ")}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-neutral-600">{question.points} pts</span>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={(e) => { e.stopPropagation(); removeQuestion(question.id); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            {activeQuestion === question.id && (
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-3 space-y-2">
                    <Label>Question Text</Label>
                    <Textarea 
                      value={question.text} 
                      onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                      placeholder="Enter your question here..."
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select 
                      value={question.type} 
                      onValueChange={(value: any) => updateQuestion(question.id, { type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MULTIPLE_CHOICE">Multiple Choice</SelectItem>
                        <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                        <SelectItem value="SHORT_ANSWER">Short Answer</SelectItem>
                        <SelectItem value="ESSAY">Essay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Points</Label>
                        <Input 
                            type="number" 
                            value={question.points} 
                            onChange={(e) => updateQuestion(question.id, { points: parseInt(e.target.value) || 0 })}
                        />
                    </div>
                </div>

                {/* Options for Multiple Choice */}
                {question.type === "MULTIPLE_CHOICE" && (
                  <div className="space-y-3">
                    <Label>Options</Label>
                    {question.options?.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-2">
                        <div 
                            className={`w-4 h-4 rounded-full border cursor-pointer flex items-center justify-center ${question.correctAnswer === option ? 'border-green-500 bg-green-500' : 'border-gray-300'}`}
                            onClick={() => updateQuestion(question.id, { correctAnswer: option })}
                        >
                            {question.correctAnswer === option && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <Input 
                          value={option} 
                          onChange={(e) => handleOptionChange(question.id, optIndex, e.target.value)}
                          className="flex-1"
                        />
                        <Button variant="ghost" size="icon" onClick={() => removeOption(question.id, optIndex)}>
                            <Trash2 className="h-4 w-4 text-gray-400" />
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={() => addOption(question.id)} className="mt-2">
                      <Plus className="h-3 w-3 mr-2" /> Add Option
                    </Button>
                  </div>
                )}

                {/* True/False Logic */}
                {question.type === "TRUE_FALSE" && (
                    <div className="space-y-3">
                        <Label>Correct Answer</Label>
                        <div className="flex gap-4">
                            <Button 
                                variant={question.correctAnswer === "true" ? "default" : "outline"}
                                onClick={() => updateQuestion(question.id, { correctAnswer: "true" })}
                                className={question.correctAnswer === "true" ? "bg-green-600 hover:bg-green-700" : ""}
                            >
                                True
                            </Button>
                            <Button 
                                variant={question.correctAnswer === "false" ? "default" : "outline"}
                                onClick={() => updateQuestion(question.id, { correctAnswer: "false" })}
                                className={question.correctAnswer === "false" ? "bg-red-600 hover:bg-red-700" : ""}
                            >
                                False
                            </Button>
                        </div>
                    </div>
                )}
                
                <div className="space-y-2">
                    <Label>Explanation (Optional)</Label>
                    <Textarea 
                        value={question.explanation || ""}
                        onChange={(e) => updateQuestion(question.id, { explanation: e.target.value })}
                        placeholder="Explain why this answer is correct..."
                        rows={2}
                    />
                </div>

              </CardContent>
            )}
          </Card>
        ))}
      </div>
      
      {questions.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-neutral-200 rounded-lg bg-neutral-50">
              <p className="text-neutral-500">No questions added yet.</p>
              <Button variant="link" onClick={addQuestion}>Add your first question</Button>
          </div>
      )}
    </div>
  );
}
