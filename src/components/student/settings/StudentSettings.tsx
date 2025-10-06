"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LearningAnalytics from "@/components/analytics/LearningAnalytics";
import OfflineSupport from "@/components/mobile/OfflineSupport";
import {
  Settings,
  Bell,
  Shield,
  Palette,
  Smartphone,
  Mail,
  BarChart3,
  Wifi,
  RefreshCw,
  Save,
  HelpCircle,
  ExternalLink,
} from "lucide-react";

interface StudentSettingsProps {
  userId: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    bio?: string;
    dateOfBirth?: string;
  };
}

export default function StudentSettings({
  userId,
  user,
}: StudentSettingsProps) {
  const [activeTab, setActiveTab] = useState("notifications");
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    email: true,
    sms: true,
    push: true,
    paymentReminders: true,
    courseUpdates: true,
    announcements: true,
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: "public",
    showProgress: true,
    showAchievements: true,
    allowMessages: true,
    dataSharing: false,
  });

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: "system",
    language: "en",
    fontSize: "medium",
    compactMode: false,
  });

  const handleSaveNotifications = () => {
    // TODO: Implement notification preferences update
    console.log("Saving notifications:", notifications);
  };

  const handleSavePrivacy = () => {
    // TODO: Implement privacy settings update
    console.log("Saving privacy:", privacySettings);
  };

  const handleSaveAppearance = () => {
    // TODO: Implement appearance settings update
    console.log("Saving appearance:", appearanceSettings);
  };

  return (
    <div className="space-y-8">
      {/* Professional Header */}
      <div className="bg-gradient-to-r from-slate-600 via-gray-700 to-zinc-800 rounded-2xl p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <Settings className="h-8 w-8" />
              </div>
              Settings & Preferences
            </h1>
            <p className="text-slate-100 text-lg">
              Manage your account, preferences, and application settings
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Help
            </Button>
            <Button className="bg-white text-slate-600 hover:bg-slate-50">
              <ExternalLink className="h-4 w-4 mr-2" />
              Support
            </Button>
          </div>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5 bg-white border shadow-sm">
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger
            value="privacy"
            className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <Shield className="h-4 w-4" />
            Privacy
          </TabsTrigger>
          <TabsTrigger
            value="appearance"
            className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger
            value="offline"
            className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <Wifi className="h-4 w-4" />
            Offline
          </TabsTrigger>
        </TabsList>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">
                  Communication Channels
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <span className="font-medium">Email</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.email}
                      onChange={(e) =>
                        setNotifications((prev) => ({
                          ...prev,
                          email: e.target.checked,
                        }))
                      }
                      className="rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-green-600" />
                      <span className="font-medium">SMS</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.sms}
                      onChange={(e) =>
                        setNotifications((prev) => ({
                          ...prev,
                          sms: e.target.checked,
                        }))
                      }
                      className="rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-purple-600" />
                      <span className="font-medium">Push</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.push}
                      onChange={(e) =>
                        setNotifications((prev) => ({
                          ...prev,
                          push: e.target.checked,
                        }))
                      }
                      className="rounded"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">
                  Notification Types
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">Payment Reminders</span>
                      <p className="text-sm text-gray-600">
                        Get reminded about upcoming payments
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.paymentReminders}
                      onChange={(e) =>
                        setNotifications((prev) => ({
                          ...prev,
                          paymentReminders: e.target.checked,
                        }))
                      }
                      className="rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">Course Updates</span>
                      <p className="text-sm text-gray-600">
                        Notifications about course changes
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.courseUpdates}
                      onChange={(e) =>
                        setNotifications((prev) => ({
                          ...prev,
                          courseUpdates: e.target.checked,
                        }))
                      }
                      className="rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">Announcements</span>
                      <p className="text-sm text-gray-600">
                        Important announcements from instructors
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.announcements}
                      onChange={(e) =>
                        setNotifications((prev) => ({
                          ...prev,
                          announcements: e.target.checked,
                        }))
                      }
                      className="rounded"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSaveNotifications}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset to Default
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy Settings */}
        <TabsContent value="privacy" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">
                  Profile Visibility
                </h4>
                <Select
                  value={privacySettings.profileVisibility}
                  onValueChange={(value) =>
                    setPrivacySettings((prev) => ({
                      ...prev,
                      profileVisibility: value,
                    }))
                  }
                >
                  <option value="public">Public</option>
                  <option value="friends">Friends Only</option>
                  <option value="private">Private</option>
                </Select>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Data Sharing</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">
                        Show Learning Progress
                      </span>
                      <p className="text-sm text-gray-600">
                        Allow others to see your course progress
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacySettings.showProgress}
                      onChange={(e) =>
                        setPrivacySettings((prev) => ({
                          ...prev,
                          showProgress: e.target.checked,
                        }))
                      }
                      className="rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">Show Achievements</span>
                      <p className="text-sm text-gray-600">
                        Display your badges and certificates
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacySettings.showAchievements}
                      onChange={(e) =>
                        setPrivacySettings((prev) => ({
                          ...prev,
                          showAchievements: e.target.checked,
                        }))
                      }
                      className="rounded"
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <span className="font-medium">Allow Messages</span>
                      <p className="text-sm text-gray-600">
                        Let other students send you messages
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacySettings.allowMessages}
                      onChange={(e) =>
                        setPrivacySettings((prev) => ({
                          ...prev,
                          allowMessages: e.target.checked,
                        }))
                      }
                      className="rounded"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSavePrivacy}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Privacy Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance & Language
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={appearanceSettings.theme}
                    onValueChange={(value) =>
                      setAppearanceSettings((prev) => ({
                        ...prev,
                        theme: value,
                      }))
                    }
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">System</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={appearanceSettings.language}
                    onValueChange={(value) =>
                      setAppearanceSettings((prev) => ({
                        ...prev,
                        language: value,
                      }))
                    }
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fontSize">Font Size</Label>
                  <Select
                    value={appearanceSettings.fontSize}
                    onValueChange={(value) =>
                      setAppearanceSettings((prev) => ({
                        ...prev,
                        fontSize: value,
                      }))
                    }
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <span className="font-medium">Compact Mode</span>
                  <p className="text-sm text-gray-600">
                    Reduce spacing for a more compact interface
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={appearanceSettings.compactMode}
                  onChange={(e) =>
                    setAppearanceSettings((prev) => ({
                      ...prev,
                      compactMode: e.target.checked,
                    }))
                  }
                  className="rounded"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSaveAppearance}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Appearance Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <LearningAnalytics />
        </TabsContent>

        {/* Offline Tab */}
        <TabsContent value="offline">
          <OfflineSupport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
