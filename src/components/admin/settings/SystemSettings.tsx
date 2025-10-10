"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Settings,
  Save,
  Mail,
  DollarSign,
  Shield,
  Bell,
  Globe,
  Database,
  Server,
  Lock,
  Users,
  FileText,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

interface SystemSettings {
  general: {
    siteName: string;
    siteUrl: string;
    contactEmail: string;
    supportEmail: string;
    timezone: string;
    language: string;
    currency: string;
  };
  email: {
    provider: string;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
  };
  payment: {
    paystackPublicKey: string;
    paystackSecretKey: string;
    currency: string;
    applicationFeePercentage: number;
    minimumPayment: number;
  };
  security: {
    requireEmailVerification: boolean;
    requirePhoneVerification: boolean;
    enableTwoFactor: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
    passwordMinLength: number;
  };
  notifications: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    pushNotifications: boolean;
    notifyAdminNewUser: boolean;
    notifyAdminNewApplication: boolean;
    notifyInstructorNewEnrollment: boolean;
  };
  features: {
    allowUserRegistration: boolean;
    allowCourseApplications: boolean;
    enableChat: boolean;
    enableForums: boolean;
    enableCertificates: boolean;
    maintenanceMode: boolean;
  };
}

export default function SystemSettings() {
  const [settings, setSettings] = useState<SystemSettings>({
    general: {
      siteName: "KM Media Training Institute",
      siteUrl: "https://kmmedia.com",
      contactEmail: "contact@kmmedia.com",
      supportEmail: "support@kmmedia.com",
      timezone: "Africa/Accra",
      language: "en",
      currency: "GHS",
    },
    email: {
      provider: "smtp",
      smtpHost: "",
      smtpPort: 587,
      smtpUser: "",
      smtpPassword: "",
      fromEmail: "noreply@kmmedia.com",
      fromName: "KM Media Training Institute",
    },
    payment: {
      paystackPublicKey: "",
      paystackSecretKey: "",
      currency: "GHS",
      applicationFeePercentage: 10,
      minimumPayment: 10,
    },
    security: {
      requireEmailVerification: true,
      requirePhoneVerification: false,
      enableTwoFactor: false,
      sessionTimeout: 60,
      maxLoginAttempts: 5,
      passwordMinLength: 8,
    },
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      pushNotifications: true,
      notifyAdminNewUser: true,
      notifyAdminNewApplication: true,
      notifyInstructorNewEnrollment: true,
    },
    features: {
      allowUserRegistration: true,
      allowCourseApplications: true,
      enableChat: false,
      enableForums: false,
      enableCertificates: true,
      maintenanceMode: false,
    },
  });

  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const handleSaveSettings = async () => {
    setLoading(true);
    setSaveStatus("saving");
    try {
      // TODO: Implement API call to save settings
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Settings saved successfully!");
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
      setSaveStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const updateGeneralSettings = (key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      general: { ...prev.general, [key]: value },
    }));
  };

  const updateEmailSettings = (key: string, value: string | number) => {
    setSettings((prev) => ({
      ...prev,
      email: { ...prev.email, [key]: value },
    }));
  };

  const updatePaymentSettings = (key: string, value: string | number) => {
    setSettings((prev) => ({
      ...prev,
      payment: { ...prev.payment, [key]: value },
    }));
  };

  const updateSecuritySettings = (key: string, value: boolean | number) => {
    setSettings((prev) => ({
      ...prev,
      security: { ...prev.security, [key]: value },
    }));
  };

  const updateNotificationSettings = (key: string, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: value },
    }));
  };

  const updateFeatureSettings = (key: string, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      features: { ...prev.features, [key]: value },
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="h-8 w-8" />
            System Settings
          </h2>
          <p className="text-gray-600 mt-1">
            Configure system-wide settings and preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saveStatus === "saved" && (
            <Badge variant="outline" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Saved
            </Badge>
          )}
          {saveStatus === "error" && (
            <Badge variant="outline" className="bg-red-100 text-red-800">
              <AlertCircle className="h-3 w-3 mr-1" />
              Error
            </Badge>
          )}
          <Button onClick={handleSaveSettings} disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save All Settings
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">
            <Globe className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="payment">
            <DollarSign className="h-4 w-4 mr-2" />
            Payment
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="features">
            <Server className="h-4 w-4 mr-2" />
            Features
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings.general.siteName}
                    onChange={(e) =>
                      updateGeneralSettings("siteName", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteUrl">Site URL</Label>
                  <Input
                    id="siteUrl"
                    value={settings.general.siteUrl}
                    onChange={(e) =>
                      updateGeneralSettings("siteUrl", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.general.contactEmail}
                    onChange={(e) =>
                      updateGeneralSettings("contactEmail", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportEmail">Support Email</Label>
                  <Input
                    id="supportEmail"
                    type="email"
                    value={settings.general.supportEmail}
                    onChange={(e) =>
                      updateGeneralSettings("supportEmail", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={settings.general.timezone}
                    onValueChange={(value) =>
                      updateGeneralSettings("timezone", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Accra">
                        Africa/Accra (GMT)
                      </SelectItem>
                      <SelectItem value="America/New_York">
                        America/New_York (EST)
                      </SelectItem>
                      <SelectItem value="Europe/London">
                        Europe/London (GMT)
                      </SelectItem>
                      <SelectItem value="Asia/Dubai">
                        Asia/Dubai (GST)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={settings.general.currency}
                    onValueChange={(value) =>
                      updateGeneralSettings("currency", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GHS">GHS (Ghanaian Cedis)</SelectItem>
                      <SelectItem value="USD">USD (US Dollar)</SelectItem>
                      <SelectItem value="EUR">EUR (Euro)</SelectItem>
                      <SelectItem value="GBP">GBP (British Pound)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    placeholder="smtp.gmail.com"
                    value={settings.email.smtpHost}
                    onChange={(e) =>
                      updateEmailSettings("smtpHost", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    type="number"
                    placeholder="587"
                    value={settings.email.smtpPort}
                    onChange={(e) =>
                      updateEmailSettings("smtpPort", parseInt(e.target.value))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpUser">SMTP Username</Label>
                  <Input
                    id="smtpUser"
                    value={settings.email.smtpUser}
                    onChange={(e) =>
                      updateEmailSettings("smtpUser", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">SMTP Password</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={settings.email.smtpPassword}
                    onChange={(e) =>
                      updateEmailSettings("smtpPassword", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromEmail">From Email</Label>
                  <Input
                    id="fromEmail"
                    type="email"
                    value={settings.email.fromEmail}
                    onChange={(e) =>
                      updateEmailSettings("fromEmail", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    value={settings.email.fromName}
                    onChange={(e) =>
                      updateEmailSettings("fromName", e.target.value)
                    }
                  />
                </div>
              </div>
              <Button variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Test Email Configuration
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Payment Configuration (Paystack)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="paystackPublicKey">Public Key</Label>
                  <Input
                    id="paystackPublicKey"
                    placeholder="pk_live_..."
                    value={settings.payment.paystackPublicKey}
                    onChange={(e) =>
                      updatePaymentSettings("paystackPublicKey", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paystackSecretKey">Secret Key</Label>
                  <Input
                    id="paystackSecretKey"
                    type="password"
                    placeholder="sk_live_..."
                    value={settings.payment.paystackSecretKey}
                    onChange={(e) =>
                      updatePaymentSettings("paystackSecretKey", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="applicationFeePercentage">
                    Application Fee Percentage
                  </Label>
                  <Input
                    id="applicationFeePercentage"
                    type="number"
                    min="0"
                    max="100"
                    value={settings.payment.applicationFeePercentage}
                    onChange={(e) =>
                      updatePaymentSettings(
                        "applicationFeePercentage",
                        parseFloat(e.target.value)
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minimumPayment">Minimum Payment (GH₵)</Label>
                  <Input
                    id="minimumPayment"
                    type="number"
                    min="1"
                    value={settings.payment.minimumPayment}
                    onChange={(e) =>
                      updatePaymentSettings(
                        "minimumPayment",
                        parseFloat(e.target.value)
                      )
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Email Verification</Label>
                    <p className="text-sm text-gray-600">
                      Users must verify their email before accessing the system
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.requireEmailVerification}
                    onCheckedChange={(checked) =>
                      updateSecuritySettings(
                        "requireEmailVerification",
                        checked
                      )
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Two-Factor Authentication</Label>
                    <p className="text-sm text-gray-600">
                      Require 2FA for all user accounts
                    </p>
                  </div>
                  <Switch
                    checked={settings.security.enableTwoFactor}
                    onCheckedChange={(checked) =>
                      updateSecuritySettings("enableTwoFactor", checked)
                    }
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">
                      Session Timeout (minutes)
                    </Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) =>
                        updateSecuritySettings(
                          "sessionTimeout",
                          parseInt(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      value={settings.security.maxLoginAttempts}
                      onChange={(e) =>
                        updateSecuritySettings(
                          "maxLoginAttempts",
                          parseInt(e.target.value)
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="passwordMinLength">
                      Minimum Password Length
                    </Label>
                    <Input
                      id="passwordMinLength"
                      type="number"
                      value={settings.security.passwordMinLength}
                      onChange={(e) =>
                        updateSecuritySettings(
                          "passwordMinLength",
                          parseInt(e.target.value)
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-gray-600">
                      Enable email notifications system-wide
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.emailNotifications}
                    onCheckedChange={(checked) =>
                      updateNotificationSettings("emailNotifications", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-gray-600">
                      Enable browser push notifications
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.pushNotifications}
                    onCheckedChange={(checked) =>
                      updateNotificationSettings("pushNotifications", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notify Admin: New Users</Label>
                    <p className="text-sm text-gray-600">
                      Notify admins when new users register
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.notifyAdminNewUser}
                    onCheckedChange={(checked) =>
                      updateNotificationSettings("notifyAdminNewUser", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notify Admin: New Applications</Label>
                    <p className="text-sm text-gray-600">
                      Notify admins when users submit applications
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.notifyAdminNewApplication}
                    onCheckedChange={(checked) =>
                      updateNotificationSettings(
                        "notifyAdminNewApplication",
                        checked
                      )
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notify Instructors: New Enrollments</Label>
                    <p className="text-sm text-gray-600">
                      Notify instructors when students enroll in their courses
                    </p>
                  </div>
                  <Switch
                    checked={
                      settings.notifications.notifyInstructorNewEnrollment
                    }
                    onCheckedChange={(checked) =>
                      updateNotificationSettings(
                        "notifyInstructorNewEnrollment",
                        checked
                      )
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Feature Settings */}
        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle>Feature Toggles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow User Registration</Label>
                    <p className="text-sm text-gray-600">
                      Allow new users to register on the platform
                    </p>
                  </div>
                  <Switch
                    checked={settings.features.allowUserRegistration}
                    onCheckedChange={(checked) =>
                      updateFeatureSettings("allowUserRegistration", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Course Applications</Label>
                    <p className="text-sm text-gray-600">
                      Allow students to apply for courses
                    </p>
                  </div>
                  <Switch
                    checked={settings.features.allowCourseApplications}
                    onCheckedChange={(checked) =>
                      updateFeatureSettings("allowCourseApplications", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Certificates</Label>
                    <p className="text-sm text-gray-600">
                      Enable certificate generation for completed courses
                    </p>
                  </div>
                  <Switch
                    checked={settings.features.enableCertificates}
                    onCheckedChange={(checked) =>
                      updateFeatureSettings("enableCertificates", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-red-600">Maintenance Mode</Label>
                    <p className="text-sm text-gray-600">
                      Put the site in maintenance mode (only admins can access)
                    </p>
                  </div>
                  <Switch
                    checked={settings.features.maintenanceMode}
                    onCheckedChange={(checked) =>
                      updateFeatureSettings("maintenanceMode", checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
