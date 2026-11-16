import { CardDocs } from "@repo/design_system/app/molecules/docs/CardDocs";
import { OFFLINE_COLOR, ONLINE_COLOR } from "@/lib/monitoring/colors";

export default function Docs() {
  return (
    <CardDocs
      overview="O último estado registado de cada site monitorizado (online ou offline), por categoria."
      legend={[
        { label: "Online", color: ONLINE_COLOR, description: "O TeamViewer vê o computador do site ligado." },
        { label: "Offline", color: OFFLINE_COLOR, description: "O computador do site não está ligado à internet (ou está desligado)." },
      ]}
      reading={[
        "O círculo mostra o código do site (os primeiros 5 caracteres); por baixo do nome, a categoria.",
        "Os sites offline aparecem primeiro, depois por ordem alfabética.",
        "O estado é o da última verificação do DisaStatus; muitos sites desligam os computadores fora do horário laboral.",
      ]}
      options={[
        "Disalab / DisaPoC / DisaLink / Todos: escolhe a categoria (por omissão, Disalab).",
        "Mostram-se 20 sites; Ver todos mostra a lista completa da categoria.",
        "Clique num site para abrir a página Estado desse site.",
        "Exportar para Excel exporta todos os sites da categoria seleccionada.",
      ]}
      endpoint="/teamviewer/sites (DisaStatus), via /api/sites"
    />
  );
}
