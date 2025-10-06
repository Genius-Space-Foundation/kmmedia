"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { makeAuthenticatedRequest } from "@/lib/token-utils";

interface OfflineContent {
  id: string;
  type: "lesson" | "resource" | "course";
  title: string;
  description: string;
  size: number; // in MB
  downloaded: boolean;
  downloadProgress: number;
  lastAccessed?: string;
}

interface OfflineSupportProps {
  userId: string;
}

export default function OfflineSupport({ userId }: OfflineSupportProps) {
  const [offlineContent, setOfflineContent] = useState<OfflineContent[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const [storageQuota, setStorageQuota] = useState({ used: 0, total: 0 });
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    // Check online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check storage quota
    checkStorageQuota();

    // Load offline content
    loadOfflineContent();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [userId]);

  const checkStorageQuota = async () => {
    if ("storage" in navigator && "estimate" in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        setStorageQuota({
          used: Math.round((estimate.usage || 0) / 1024 / 1024), // MB
          total: Math.round((estimate.quota || 0) / 1024 / 1024), // MB
        });
      } catch (error) {
        console.error("Error checking storage quota:", error);
      }
    }
  };

  const loadOfflineContent = async () => {
    try {
      // Load from IndexedDB or localStorage
      const saved = localStorage.getItem(`offline-content-${userId}`);
      if (saved) {
        setOfflineContent(JSON.parse(saved));
      } else {
        // Load default content that can be downloaded
        const response = await makeAuthenticatedRequest(
          `/api/student/offline-content/${userId}`
        );
        const result = await response.json();

        if (result.success) {
          setOfflineContent(result.data.content);
        }
      }
    } catch (error) {
      console.error("Error loading offline content:", error);
    }
  };

  const downloadContent = async (contentId: string) => {
    setDownloading(contentId);

    try {
      // Simulate download progress
      const content = offlineContent.find((c) => c.id === contentId);
      if (!content) return;

      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200));

        setOfflineContent((prev) =>
          prev.map((c) =>
            c.id === contentId ? { ...c, downloadProgress: progress } : c
          )
        );
      }

      // Mark as downloaded
      setOfflineContent((prev) =>
        prev.map((c) =>
          c.id === contentId
            ? { ...c, downloaded: true, downloadProgress: 100 }
            : c
        )
      );

      // Save to localStorage
      localStorage.setItem(
        `offline-content-${userId}`,
        JSON.stringify(
          offlineContent.map((c) =>
            c.id === contentId
              ? { ...c, downloaded: true, downloadProgress: 100 }
              : c
          )
        )
      );
    } catch (error) {
      console.error("Error downloading content:", error);
    } finally {
      setDownloading(null);
    }
  };

  const deleteOfflineContent = (contentId: string) => {
    setOfflineContent((prev) => {
      const updated = prev.map((c) =>
        c.id === contentId
          ? { ...c, downloaded: false, downloadProgress: 0 }
          : c
      );

      localStorage.setItem(
        `offline-content-${userId}`,
        JSON.stringify(updated)
      );
      return updated;
    });
  };

  const downloadAll = async () => {
    const downloadableContent = offlineContent.filter((c) => !c.downloaded);

    for (const content of downloadableContent) {
      await downloadContent(content.id);
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case "lesson":
        return "📚";
      case "resource":
        return "📄";
      case "course":
        return "🎓";
      default:
        return "📁";
    }
  };

  const formatFileSize = (sizeInMB: number) => {
    if (sizeInMB < 1) {
      return `${Math.round(sizeInMB * 1024)} KB`;
    }
    return `${sizeInMB.toFixed(1)} MB`;
  };

  const downloadedContent = offlineContent.filter((c) => c.downloaded);
  const totalDownloadedSize = downloadedContent.reduce(
    (sum, c) => sum + c.size,
    0
  );
  const storagePercentage =
    storageQuota.total > 0 ? (storageQuota.used / storageQuota.total) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Offline Learning</h2>
          <p className="text-gray-600">Download content for offline access</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isOnline ? "default" : "destructive"}>
            {isOnline ? "Online" : "Offline"}
          </Badge>
          {downloadedContent.length > 0 && (
            <Badge variant="outline">
              {downloadedContent.length} downloaded
            </Badge>
          )}
        </div>
      </div>

      {/* Storage Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Usage</CardTitle>
          <CardDescription>Manage your offline content storage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Storage Used</span>
              <span className="text-sm text-gray-600">
                {storageQuota.used} MB / {storageQuota.total} MB
              </span>
            </div>
            <Progress value={storagePercentage} className="h-2" />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-900">Offline Content</p>
                <p className="text-gray-600">
                  {formatFileSize(totalDownloadedSize)} (
                  {downloadedContent.length} items)
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-900">Available Space</p>
                <p className="text-gray-600">
                  {formatFileSize(storageQuota.total - storageQuota.used)}{" "}
                  remaining
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Download All Button */}
      {offlineContent.some((c) => !c.downloaded) && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-xl">⬇️</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Download All Available Content
                  </h3>
                  <p className="text-sm text-gray-600">
                    Download all content for offline access
                  </p>
                </div>
              </div>
              <Button
                onClick={downloadAll}
                disabled={downloading !== null || !isOnline}
                className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
              >
                {downloading ? "Downloading..." : "Download All"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Offline Content List */}
      <Card>
        <CardHeader>
          <CardTitle>Available Content</CardTitle>
          <CardDescription>
            Download lessons and resources for offline learning
          </CardDescription>
        </CardHeader>
        <CardContent>
          {offlineContent.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📱</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No offline content available
              </h3>
              <p className="text-gray-600">
                Content will appear here when you enroll in courses.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {offlineContent.map((content) => (
                <div
                  key={content.id}
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    content.downloaded
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white text-xl">
                          {getContentIcon(content.type)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {content.title}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {content.description}
                        </p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-500">
                            {formatFileSize(content.size)}
                          </span>
                          {content.downloaded && (
                            <Badge
                              variant="outline"
                              className="text-green-600 border-green-200"
                            >
                              Downloaded
                            </Badge>
                          )}
                          {content.lastAccessed && (
                            <span className="text-xs text-gray-500">
                              Last accessed:{" "}
                              {new Date(
                                content.lastAccessed
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {!content.downloaded && (
                        <>
                          {downloading === content.id && (
                            <div className="flex items-center space-x-2">
                              <Progress
                                value={content.downloadProgress}
                                className="w-20 h-2"
                              />
                              <span className="text-xs text-gray-600">
                                {content.downloadProgress}%
                              </span>
                            </div>
                          )}
                          <Button
                            size="sm"
                            onClick={() => downloadContent(content.id)}
                            disabled={downloading !== null || !isOnline}
                          >
                            Download
                          </Button>
                        </>
                      )}
                      {content.downloaded && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteOfflineContent(content.id)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Offline Mode Tips */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle>Offline Learning Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">
                📱 Mobile Learning
              </h4>
              <p className="text-sm text-gray-600">
                Download content when connected to WiFi to save data costs.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">🔋 Battery Life</h4>
              <p className="text-sm text-gray-600">
                Offline mode uses less battery than streaming content online.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">📚 Study Anywhere</h4>
              <p className="text-sm text-gray-600">
                Learn during commutes, travel, or in areas with poor internet.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">🔄 Sync Progress</h4>
              <p className="text-sm text-gray-600">
                Your progress syncs automatically when you're back online.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


