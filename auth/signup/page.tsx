
import { SignUpForm } from "./_components/signup-form";

export default function SignUpPage() {
  return (
    <div className="container max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Get Started</h1>
        <p className="text-gray-600">Create your Ground UP Careers account</p>
      </div>
      <SignUpForm />
    </div>
  );
}
