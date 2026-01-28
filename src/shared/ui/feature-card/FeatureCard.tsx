import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  iconClass?: string;
}

export function FeatureCard({
  title,
  description,
  icon: Icon,
  href,
  iconClass = "text-black dark:text-white",
}: FeatureCardProps) {
  return (
    <Link href={href}>
      <div className="relative overflow-hidden rounded-lg border bg-background p-6 h-full hover:bg-accent/50 transition-colors">
        <div className="flex flex-col gap-4 h-full">
          <Icon className={`h-12 w-12 ${iconClass}`} strokeWidth={1.5} />
          <div className="space-y-2 flex-1">
            <h3 className="font-bold">{title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}
