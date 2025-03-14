import { MessageSquare } from "lucide-react";
import Link from "next/link";

export function ChatButton() {
  return (
    <Link
      href="https://wa.me/393756832628"
      rel="noopener noreferrer"
      target="_blank"
      className="fixed bottom-5 right-5 flex size-12 items-center justify-center rounded-full bg-primary md:size-14"
    >
      <MessageSquare className="text-primary-foreground" />
    </Link>
  );
};
