import { CardDocs } from "@repo/design_system/app/molecules/docs/CardDocs";

export default function Docs() {
  return (
    <CardDocs
      overview="Cada vez que o site ficou offline no período: quando caiu, quando voltou e quanto tempo esteve fora."
      reading={[
        "Pendente: o site ainda não voltou (sem hora de regresso); o tempo offline conta até agora.",
        "Datas na hora de Maputo. O tempo offline é o tempo total (não só o horário laboral), arredondado a minutos, horas ou dias.",
      ]}
      options={[
        "Todos / Pendentes / Completos: filtra pelo estado da ausência.",
        "Editar período: intervalo de datas (por omissão, últimos 12 meses).",
        "Ordene clicando no título de uma coluna; procure pelo ID.",
        "Exportar para Excel exporta as linhas do filtro actual.",
      ]}
      endpoint="/teamviewer/offline-history/interval-dates-health-facility (DisaStatus), via /api/history"
    />
  );
}
