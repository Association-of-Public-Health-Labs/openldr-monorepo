"use client";

import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@repo/design_system/components/ui/button";
import { DEMO_VERSIONS, initialQuality, type ConnectionHint, type DemoQuality } from "../lib/demo-video";

const POSTER = "/demo/openldr-demo-poster.jpg";
const MUTED = "text-[#637381] dark:text-[#919EAB]";

/** The demo video with a choice between HD and a light 720p version; switching keeps the position. */
export function DemoPlayer() {
  const ref = useRef<HTMLVideoElement>(null);
  const [quality, setQuality] = useState<DemoQuality>("hd");
  const resume = useRef<{ time: number; playing: boolean } | null>(null);

  // On a slow connection (or with data saving on) start with the light version.
  useEffect(() => {
    const connection = (navigator as Navigator & { connection?: ConnectionHint }).connection;
    setQuality(initialQuality(connection));
  }, []);

  function choose(next: DemoQuality) {
    if (next === quality) return;
    const v = ref.current;
    resume.current = v ? { time: v.currentTime, playing: !v.paused } : null;
    setQuality(next);
  }

  function onLoadedMetadata() {
    const v = ref.current;
    const r = resume.current;
    if (!v || !r) return;
    resume.current = null;
    v.currentTime = r.time;
    if (r.playing) void v.play().catch(() => {});
  }

  const current = DEMO_VERSIONS[quality];

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2" role="group" aria-label="Qualidade do vídeo">
        {(Object.keys(DEMO_VERSIONS) as DemoQuality[]).map((q) => (
          <Button key={q} size="sm" variant={q === quality ? "default" : "outline"} aria-pressed={q === quality} onClick={() => choose(q)}>
            {DEMO_VERSIONS[q].label} · {DEMO_VERSIONS[q].size}
          </Button>
        ))}
        <span className={`text-xs ${MUTED}`}>Se o vídeo parar ou demorar a carregar, escolha a versão leve.</span>
      </div>
      <div className="overflow-hidden rounded-2xl bg-black shadow-[0_12px_24px_-4px_rgba(145,158,171,0.24)] dark:shadow-none dark:ring-1 dark:ring-[rgba(145,158,171,0.16)]">
        <video
          ref={ref}
          key={current.src}
          className="aspect-video w-full"
          src={current.src}
          poster={POSTER}
          controls
          preload="metadata"
          playsInline
          onLoadedMetadata={onLoadedMetadata}
        >
          O seu navegador não consegue reproduzir este vídeo. <a href={current.src}>Descarregue o ficheiro MP4</a>.
        </video>
      </div>
      <div className="mt-4">
        <Button asChild variant="outline">
          <a href={current.src} download>
            <Download />
            Descarregar o vídeo ({current.label}, {current.size})
          </a>
        </Button>
      </div>
    </div>
  );
}
