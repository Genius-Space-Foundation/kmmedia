"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExtensionApprovalInterfaceProps {
  assignmentId: string;
}

export function ExtensionApprovalInterface({ assignmentId }: ExtensionApprovalInterfaceProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Extension Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500">No extension requests available</p>
      </CardContent>
    </Card>
  );
}