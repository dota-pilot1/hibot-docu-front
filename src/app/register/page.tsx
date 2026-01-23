import { RegisterForm } from "@/features/auth-by-email/ui/RegisterForm";

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-black">
            <RegisterForm />
        </div>
    );
}
