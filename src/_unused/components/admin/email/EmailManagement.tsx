"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  Mail,
  Send,
  Users,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  type: "WELCOME" | "APPLICATION_APPROVED" | "APPLICATION_REJECTED" | "ENROLLMENT" | "CUSTOM";
}

export default function EmailManagement() {
  const [selectedRecipients, setSelectedRecipients] = useState<string>("all");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [sending, setSending] = useState(false);

  const templates: EmailTemplate[] = [
    {
      id: "1",
      name: "Welcome Email",
      subject: "Welcome to KM Media Training Institute",
      content: "Dear {{name}},\n\nWelcome to our platform...",
      type: "WELCOME",
    },
    {
      id: "2",
      name: "Application Approved",
      subject: "Your Application has been Approved",
      content: "Dear {{name}},\n\nCongratulations! Your application for {{course}} has been approved...",
      type: "APPLICATION_APPROVED",
    },
    {
      id: "3",
      name: "Application Rejected",
      subject: "Application Status Update",
      content: "Dear {{name}},\n\nThank you for your application...",
      type: "APPLICATION_REJECTED",
    },
  ];

  const handleSendEmail = async () => {
    if (!emailSubject || !emailBody) {
      toast.error("Please fill in subject and body");
      return;
    }

    setSending(true);
    try {
      // TODO: Implement email sending API
      await new Promise((resolve) => setTimeout(resolve, 2000));
      toast.success("Email sent successfully");
      setEmailSubject("");
      setEmailBody("");
    } catch (error) {
      toast.error("Failed to send email");
    } finally {
      setSending(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setEmailSubject(template.subject);
      setEmailBody(template.content);
      setSelectedTemplate(templateId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Mail className="h-8 w-8" />
          Email & Notifications
        </h2>
        <p className="text-gray-600 mt-1">
          Send emails and manage notification templates
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email Composer */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Compose Email</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Recipients */}
            <div className="space-y-2">
              <Label>Recipients</Label>
              <Select value={selectedRecipients} onValueChange={setSelectedRecipients}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="students">All Students</SelectItem>
                  <SelectItem value="instructors">All Instructors</SelectItem>
                  <SelectItem value="admins">All Admins</SelectItem>
                  <SelectItem value="custom">Custom List</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Template Selection */}
            <div className="space-y-2">
              <Label>Email Template (Optional)</Label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Enter email subject"
              />
            </div>

            {/* Body */}
            <div className="space-y-2">
              <Label htmlFor="body">Message</Label>
              <Textarea
                id="body"
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
                placeholder="Enter your message..."
                rows={10}
              />
              <p className="text-sm text-gray-600">
                Available variables: {`{{name}}, {{email}}, {{course}}`}
              </p>
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSendEmail}
              disabled={sending}
              className="w-full"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Email Statistics */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Email Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Sent Today</p>
                <p className="text-2xl font-bold">245</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Sent This Week</p>
                <p className="text-2xl font-bold">1,523</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Delivery Rate</p>
                <p className="text-2xl font-bold text-green-600">98.5%</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Recent Emails</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    subject: "Welcome Email",
                    recipients: 15,
                    status: "Sent",
                    time: "2 hours ago",
                  },
                  {
                    subject: "Application Approved",
                    recipients: 8,
                    status: "Sent",
                    time: "5 hours ago",
                  },
                  {
                    subject: "Course Reminder",
                    recipients: 120,
                    status: "Sent",
                    time: "1 day ago",
                  },
                ].map((email, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <p className="font-medium text-sm">{email.subject}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {email.recipients} recipients
                      </Badge>
                      <span className="text-xs text-gray-600">{email.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Email Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleTemplateSelect(template.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <h4 className="font-semibold">{template.name}</h4>
                  </div>
                  <Badge variant="outline">{template.type}</Badge>
                </div>
                <p className="text-sm text-gray-600">{template.subject}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

