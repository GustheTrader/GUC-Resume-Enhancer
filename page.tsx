
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Upload, 
  Zap, 
  Eye, 
  Download, 
  CheckCircle, 
  Target,
  FileText,
  Sparkles,
  TrendingUp,
  Shield
} from "lucide-react";

export default function HomePage() {
  const features = [
    {
      icon: <Upload className="h-8 w-8" />,
      title: "Upload Resume",
      description: "Support for PDF and Word documents with instant parsing"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "AI Enhancement",
      description: "Multiple enhancement styles including ATS optimization"
    },
    {
      icon: <Eye className="h-8 w-8" />,
      title: "Side-by-Side Preview",
      description: "Compare original and enhanced versions instantly"
    },
    {
      icon: <Download className="h-8 w-8" />,
      title: "Download PDF",
      description: "Get your enhanced resume as a professional PDF"
    }
  ];

  const enhancements = [
    {
      icon: <Target className="h-6 w-6 text-orange-600" />,
      title: "ATS Optimization",
      description: "Ensure your resume passes Applicant Tracking Systems"
    },
    {
      icon: <Sparkles className="h-6 w-6 text-orange-600" />,
      title: "Power Words & Action Verbs",
      description: "Strengthen your impact with compelling language"
    },
    {
      icon: <FileText className="h-6 w-6 text-orange-600" />,
      title: "Professional Formatting",
      description: "Clean, modern layout that stands out"
    },
    {
      icon: <TrendingUp className="h-6 w-6 text-orange-600" />,
      title: "Industry Keywords",
      description: "Relevant keywords for your specific field"
    },
    {
      icon: <CheckCircle className="h-6 w-6 text-orange-600" />,
      title: "Grammar & Spelling",
      description: "Error-free content with professional polish"
    },
    {
      icon: <Shield className="h-6 w-6 text-orange-600" />,
      title: "Overall Improvement",
      description: "Comprehensive enhancement for maximum impact"
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-50 via-white to-orange-100 py-20">
        <div className="container max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-8">
            <div className="relative w-20 h-20">
              <Image
                src="/logo.png"
                alt="Ground UP Careers"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Enhance Your Resume with <span className="text-orange-600">AI</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Transform your resume into a career-launching document with our AI-powered enhancement tool. 
            Optimize for ATS systems, improve formatting, and boost your professional impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-orange-600 hover:bg-orange-700" asChild>
              <Link href="/auth/signup">Get Started Free</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/signin">Sign In</Link>
            </Button>
          </div>
          <div className="mt-6">
            <p className="text-sm text-gray-600 mb-2">
              Want to try without signing up?
            </p>
            <Button size="sm" variant="link" className="text-orange-600" asChild>
              <Link href="/api-keys-light">Use Light Mode (No Login Required) →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple, powerful, and designed to get you results
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4 text-orange-600">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Enhancement Types Section */}
      <section className="py-20 bg-gray-50">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Enhancement Types
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose from multiple AI-powered enhancement options
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {enhancements.map((enhancement, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <CardContent className="pt-0">
                  <div className="flex items-center gap-3 mb-3">
                    {enhancement.icon}
                    <h3 className="text-lg font-semibold text-gray-900">
                      {enhancement.title}
                    </h3>
                  </div>
                  <p className="text-gray-600">
                    {enhancement.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-orange-600">
        <div className="container max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Boost Your Career?
          </h2>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have enhanced their resumes with our AI-powered tool
          </p>
          <Button size="lg" variant="secondary" className="bg-white text-orange-600 hover:bg-gray-100" asChild>
            <Link href="/auth/signup">Start Enhancing Now</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
