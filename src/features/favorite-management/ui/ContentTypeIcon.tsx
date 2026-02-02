import {
  Folder,
  Terminal,
  Link,
  FileText,
} from "lucide-react";
import type { FavoriteType } from "@/entities/favorite/model/types";

interface ContentTypeIconProps {
  type: FavoriteType;
  className?: string;
}

export const ContentTypeIcon = ({
  type,
  className = "h-4 w-4",
}: ContentTypeIconProps) => {
  switch (type) {
    case "ROOT":
      return <Folder className={className} />;
    case "COMMAND":
      return <Terminal className={className} />;
    case "LINK":
      return <Link className={className} />;
    case "DOCUMENT":
      return <FileText className={className} />;
    default:
      return <Terminal className={className} />;
  }
};
