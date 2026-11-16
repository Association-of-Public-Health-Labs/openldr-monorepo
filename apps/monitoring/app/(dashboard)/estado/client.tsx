"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CardMessage } from "@repo/design_system/app/organisms/report/card-message";
import { useReport } from "@repo/design_system/hooks/report/use-report";
import { monitoringGet } from "@/lib/monitoring/api";
import { estadoLoading, resolveEstado } from "@/lib/monitoring/estado";
import type { Host, HostDetail } from "@/lib/monitoring/types";
import HostInfo from "./reports/host-info";
import HostConnectivity from "./reports/host-connectivity";
import HostHeatmap from "./reports/host-heatmap";
import ConnectivityHistory from "./reports/connectivity-history";

export default function EstadoClient() {
  const router = useRouter();
  const codeParam = useSearchParams().get("code");
  const sites = useReport(() => monitoringGet<{ hosts: Host[] }>("/api/sites").then((r) => r.hosts ?? []), []);
  const hosts = sites.data ?? [];
  const view = sites.data ? resolveEstado(codeParam, hosts) : null;
  const code = view?.kind === "show" ? view.code : null;

  const redirectTo = view?.kind === "redirect" ? view.code : null;

  useEffect(() => {
    if (redirectTo) router.replace(`/estado?code=${encodeURIComponent(redirectTo)}`);
  }, [redirectTo, router]);

  const detail = useReport(
    () => (code ? monitoringGet<HostDetail>(`/api/hosts/${encodeURIComponent(code)}`) : Promise.resolve(null)),
    [code],
  );
  // The previous site's detail stays in `detail.data` while the next one loads; never show it for another code.
  const shown = detail.data && detail.data.host.code === code ? detail.data : null;
  const detailLoading = estadoLoading({
    sitesLoading: sites.loading, view, detailLoading: detail.loading, detailError: detail.error, hasDetail: !!shown,
  });
  const select = (next: string) => router.push(`/estado?code=${encodeURIComponent(next)}`);

  if (sites.error) return <CardMessage tone="error" message={sites.error} onRetry={sites.retry} />;
  if (view?.kind === "empty") return <CardMessage tone="empty" message="Sem sites disponíveis." />;

  return (
    <div className="w-full @container">
      <div className="grid grid-cols-1 gap-6">
        {view?.kind === "not-found" && <CardMessage tone="empty" message="Site não encontrado." />}
        <HostInfo
          hosts={hosts}
          code={code}
          detail={shown}
          loading={detailLoading}
          error={detail.error}
          onRetry={detail.retry}
          onSelect={select}
        />
        {view?.kind !== "not-found" && (
          <>
            <div className="grid grid-cols-1 gap-6 @[840px]:grid-cols-2">
              <HostConnectivity detail={shown} loading={detailLoading} error={detail.error} onRetry={detail.retry} />
              <HostHeatmap detail={shown} loading={detailLoading} error={detail.error} onRetry={detail.retry} />
            </div>
            <ConnectivityHistory code={code} hostName={shown?.host.name ?? ""} />
          </>
        )}
      </div>
    </div>
  );
}
