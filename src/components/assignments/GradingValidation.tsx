"use client";

import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, CheckCircle } from "lucide-react";

interface GradingValidationProps {
  validation?: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    calculatedGrade?: {
      originalScore: number;
      finalScore: number;
      latePenalty: number;
      penaltyAmount: number;
    };
  };
  className?: string;
}

export function GradingValidation({
  validation,
  className = "",
}: GradingValidationProps) {
  if (!validation) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Errors */}
      {validation.errors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {validation.errors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Warnings */}
      {validation.warnings.length > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              {validation.warnings.map((warning, index) => (
                <div key={index}>{warning}</div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Grade Calculation Summary */}
      {validation.calculatedGrade &&
        validation.calculatedGrade.latePenalty > 0 && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <div className="font-medium">Grade Calculation:</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Original Score:</div>
                  <div>{validation.calculatedGrade.originalScore}</div>
                  <div>Late Penalty:</div>
                  <div>
                    {(validation.calculatedGrade.latePenalty * 100).toFixed(1)}%
                  </div>
                  <div>Penalty Amount:</div>
                  <div>
                    -{validation.calculatedGrade.penaltyAmount.toFixed(1)}
                  </div>
                  <div className="font-medium">Final Score:</div>
                  <div className="font-medium">
                    {validation.calculatedGrade.finalScore.toFixed(1)}
                  </div>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}
    </div>
  );
}
