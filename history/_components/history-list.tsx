
'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, Download, Calendar, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Resume {
  id: string;
  originalName: string;
  status: string;
  createdAt: string;
  enhancements: {
    id: string;
    enhancementType: string;
    status: string;
    llmProvider: string;
    createdAt: string;
  }[];
}

export function HistoryList() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await fetch("/api/resumes");
      if (response.ok) {
        const data = await response.json();
        setResumes(data.resumes || []);
      }
    } catch (error) {
      console.error("Error fetching resumes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getEnhancementTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      ats: "ATS Optimization",
      action_verbs: "Power Words",
      formatting: "Formatting",
      keywords: "Keywords",
      grammar: "Grammar",
      overall: "Overall",
    };
    return types[type] || type;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (resumes.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-16">
          <FileText className="h-16 w-16 mx-auto mb-6 text-gray-300" />
          <h3 className="text-xl font-medium text-gray-900 mb-3">No Resumes Yet</h3>
          <p className="text-gray-600 mb-6">
            Upload your first resume to start enhancing it with AI
          </p>
          <Button asChild className="bg-orange-600 hover:bg-orange-700">
            <Link href="/dashboard">Upload Resume</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {resumes.map((resume) => (
        <Card key={resume.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FileText className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <CardTitle className="text-lg text-gray-900">{resume.originalName}</CardTitle>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                    <Calendar className="h-4 w-4" />
                    <span>Uploaded {formatDistanceToNow(new Date(resume.createdAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={resume.status === 'uploaded' ? 'secondary' : 'default'}>
                  {resume.status}
                </Badge>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/enhance/${resume.id}`}>
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            {resume.enhancements.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  <Zap className="h-4 w-4 text-orange-600" />
                  <span>{resume.enhancements.length} Enhancement{resume.enhancements.length !== 1 ? 's' : ''}</span>
                </div>
                
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {resume.enhancements.map((enhancement) => (
                    <div
                      key={enhancement.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm text-gray-900">
                          {getEnhancementTypeLabel(enhancement.enhancementType)}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                          <span>{enhancement.llmProvider}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(enhancement.createdAt), { addSuffix: true })}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={enhancement.status === 'completed' ? 'default' : 
                                  enhancement.status === 'processing' ? 'secondary' : 'destructive'}
                          className="text-xs"
                        >
                          {enhancement.status}
                        </Badge>
                        
                        {enhancement.status === 'completed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            asChild
                          >
                            <Link href={`/api/download-resume/${enhancement.id}`}>
                              <Download className="h-3 w-3" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p className="text-sm">No enhancements yet</p>
                <Button variant="outline" size="sm" className="mt-2" asChild>
                  <Link href={`/enhance/${resume.id}`}>
                    <Zap className="h-4 w-4 mr-1" />
                    Enhance Now
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
