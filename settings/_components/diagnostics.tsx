
'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  Bug, 
  Trash2, 
  RefreshCw,
  Download,
  Filter
} from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Log {
  id: string;
  level: string;
  category: string;
  message: string;
  metadata: any;
  createdAt: string;
}

const LOG_LEVELS = [
  { value: "all", label: "All Levels" },
  { value: "error", label: "Errors", icon: AlertCircle, color: "text-red-600" },
  { value: "warning", label: "Warnings", icon: AlertTriangle, color: "text-yellow-600" },
  { value: "info", label: "Info", icon: Info, color: "text-blue-600" },
  { value: "debug", label: "Debug", icon: Bug, color: "text-gray-600" },
];

const LOG_CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "api_key", label: "API Keys" },
  { value: "resume_enhancement", label: "Resume Enhancement" },
  { value: "auth", label: "Authentication" },
  { value: "system", label: "System" },
  { value: "database", label: "Database" },
  { value: "file_upload", label: "File Upload" },
];

export function Diagnostics() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [selectedLevel, selectedCategory]);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (selectedLevel !== "all") params.append("level", selectedLevel);
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      
      const response = await fetch(`/api/logs?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      } else {
        toast.error("Failed to fetch logs");
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast.error("Failed to load diagnostic logs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearLogs = async () => {
    if (!confirm("Are you sure you want to clear all your logs? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch("/api/logs", {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Logs cleared successfully");
        fetchLogs();
      } else {
        toast.error("Failed to clear logs");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  const handleExportLogs = () => {
    const logsJson = JSON.stringify(logs, null, 2);
    const blob = new Blob([logsJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `diagnostic-logs-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Logs exported successfully");
  };

  const getLevelIcon = (level: string) => {
    const levelConfig = LOG_LEVELS.find(l => l.value === level);
    if (!levelConfig?.icon) return null;
    const Icon = levelConfig.icon;
    return <Icon className={`h-4 w-4 ${levelConfig.color}`} />;
  };

  const getLevelBadge = (level: string) => {
    const colors: Record<string, string> = {
      error: "bg-red-100 text-red-800",
      warning: "bg-yellow-100 text-yellow-800",
      info: "bg-blue-100 text-blue-800",
      debug: "bg-gray-100 text-gray-800",
    };
    return (
      <Badge className={`${colors[level] || ""} border-0`}>
        {level.toUpperCase()}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Diagnostic Logs</CardTitle>
          <CardDescription>
            Loading diagnostic information...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Diagnostic Logs</CardTitle>
            <CardDescription>
              View system logs to troubleshoot issues and monitor activity
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLogs}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportLogs}
              disabled={logs.length === 0}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearLogs}
              disabled={logs.length === 0}
              className="gap-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium">Filters:</span>
          </div>
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {LOG_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {LOG_CATEGORIES.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Logs List */}
        {logs.length === 0 ? (
          <div className="text-center py-12">
            <Bug className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Logs Found</h3>
            <p className="text-gray-600">
              {selectedLevel !== "all" || selectedCategory !== "all"
                ? "No logs match the selected filters"
                : "System logs will appear here as you use the application"}
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {logs.map((log) => (
                <Card
                  key={log.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    expandedLog === log.id ? "ring-2 ring-orange-500" : ""
                  }`}
                  onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">{getLevelIcon(log.level)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {getLevelBadge(log.level)}
                            <Badge variant="outline" className="text-xs">
                              {log.category}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {new Date(log.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 font-medium mb-1">
                            {log.message}
                          </p>
                          {expandedLog === log.id && log.metadata && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-md">
                              <p className="text-xs font-medium text-gray-700 mb-2">
                                Additional Details:
                              </p>
                              <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-x-auto">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        )}

        {/* Stats */}
        {logs.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <div className="grid grid-cols-4 gap-4">
              {LOG_LEVELS.filter(l => l.value !== "all").map((level) => {
                const count = logs.filter(log => log.level === level.value).length;
                return (
                  <div key={level.value} className="text-center">
                    <div className={`text-2xl font-bold ${level.color}`}>
                      {count}
                    </div>
                    <div className="text-xs text-gray-600">{level.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
