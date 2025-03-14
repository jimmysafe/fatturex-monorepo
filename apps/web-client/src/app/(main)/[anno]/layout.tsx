import { ChatButton } from "@/components/common/chat-button";
import { GlobalAlerts } from "@/components/common/global-alerts";
import { Navigation } from "@/components/common/navigation";
import { _getAnniContabilita } from "@/lib/cached/get-anni-contabilita";
import { _getPartitaIva } from "@/lib/cached/get-partita-iva";
import { _getUserSubscription } from "@/lib/cached/get-subscription";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // ! Prefetching
  _getUserSubscription();
  _getPartitaIva();
  _getAnniContabilita();

  return (
    <main className="container mx-auto max-w-5xl py-6">
      <Navigation />
      <GlobalAlerts />
      <section className="py-10">
        {children}
      </section>
      <ChatButton />
    </main>
  );
}
