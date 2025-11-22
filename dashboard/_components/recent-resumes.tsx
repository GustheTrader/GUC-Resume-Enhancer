
'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Clock, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Resume {
  id: string;
  originalName: string;
  status: string;
  createdAt: string;
  enhancements: { id: string; enhancementType: string; status: string }[];
}

export function RecentResumes() {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRecentResumes();
  }, []);

  const fetchRecentResumes = async () => {
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Resumes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
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
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Resumes
        </CardTitle>
      </CardHeader>
      <CardContent>
        {resumes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">No resumes uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {resumes.slice(0, 5).map((resume) => (
              <div
                key={resume.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <FileText className="h-4 w-4 text-orange-600 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-gray-900 truncate">
                      {resume.originalName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(resume.createdAt), { addSuffix: true })}
                    </p>
                    <div className="flex gap-1 mt-1">
                      {resume.enhancements.map((enhancement) => (
                        <span
                          key={enhancement.id}
                          className={`inline-block px-1.5 py-0.5 rounded-full text-xs ${
                            enhancement.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : enhancement.status === 'processing'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {enhancement.enhancementType}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/enhance/${resume.id}`}>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
            
            {resumes.length > 5 && (
              <Button variant="outline" className="w-full" asChild>
                <Link href="/history">View All Resumes</Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
