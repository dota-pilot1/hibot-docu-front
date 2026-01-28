import { UserList } from "@/features/user-list/ui/UserList";
import { Button } from "@/shared/ui/button";
import Link from "next/link";

export default function UsersPage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Button variant="outline" asChild>
          <Link href="/">Home</Link>
        </Button>
      </div>
      <UserList />
    </div>
  );
}
