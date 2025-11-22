
import { SignInForm } from "./_components/signin-form";

export default function SignInPage() {
  return (
    <div className="container max-w-md mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
        <p className="text-gray-600">Sign in to your Ground UP Careers account</p>
      </div>
      <SignInForm />
    </div>
  );
}
