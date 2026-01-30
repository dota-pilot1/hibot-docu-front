"use client";

import { RegisterForm } from "@/features/auth-by-email/ui/RegisterForm";
import { Sparkles, Shield, Users, Zap } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-4 px-4">
      <div className="w-full max-w-5xl flex gap-6 lg:gap-8">
        {/* Left Column - Brand Message */}
        <div className="hidden lg:flex lg:w-[42%] flex-col justify-center">
          <div className="max-w-sm">
            <div className="mb-5">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                HiBot Docu
              </h1>
              <p className="text-lg font-semibold text-foreground mb-2">
                키오스크 개발 문서 관리
              </p>
              <p className="text-sm text-muted-foreground">
                하이봇 팀의 키오스크 프로젝트 협업 공간
              </p>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-5">
              <div className="flex items-start gap-2.5">
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-0.5 text-sm">
                    실시간 협업
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    키오스크 개발 진행상황을 팀원들과 실시간으로 공유합니다
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Shield className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-0.5 text-sm">
                    프로젝트 관리
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    개발 일정, 이슈, TODO를 체계적으로 관리합니다
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-0.5 text-sm">
                    문서 정리
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    개발 문서, 회의록, 아이디어를 한곳에서 관리합니다
                  </p>
                </div>
              </div>
            </div>

            {/* Trust Indicators */}
            <div className="border-t pt-3.5">
              <div className="flex items-center gap-2 mb-1.5">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  이미{" "}
                  <span className="text-foreground font-semibold">500+</span>{" "}
                  팀이 사용 중
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  SOC2 인증
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  GDPR 준수
                </span>
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  ISO 27001
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Register Form */}
        <div className="flex-1 lg:w-[58%] flex items-center justify-center">
          <div className="w-full max-w-sm">
            {/* Mobile Brand Header */}
            <div className="lg:hidden mb-4 text-center">
              <h1 className="text-2xl font-bold text-foreground mb-1">
                HiBot Docu
              </h1>
              <p className="text-sm text-muted-foreground">
                키오스크 개발 문서 관리
              </p>
            </div>

            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  );
}
