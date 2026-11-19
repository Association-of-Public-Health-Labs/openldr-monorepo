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
        "A barra no topo mostra que parte da categoria está offline agora.",
        "Os sites estão em dois grupos, Offline agora e Online, cada um por ordem alfabética.",
        "Cada cartão mostra o nome, o código, a província e o distrito; no rodapé, o estado e há quanto tempo foi verificado.",
        "O estado é o da última verificação do DisaStatus, lido sem cache; a tabela actualiza-se sozinha a cada minuto enquanto a página está aberta.",
        "Muitos sites desligam os computadores fora do horário laboral.",
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
