import { notFound } from "next/navigation";
import { CardMessage } from "@repo/design_system/app/organisms/report/card-message";
import { UNRELEASED_PAGES } from "@/lib/monitoring/nav";

export default function HistoricoPage() {
  if (process.env.NODE_ENV === "production" && UNRELEASED_PAGES.includes("/historico")) notFound();
  return <CardMessage tone="empty" message="Histórico em breve." />;
}
