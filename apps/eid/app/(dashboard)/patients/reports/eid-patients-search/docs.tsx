import { CardDocs } from "@/components/card-docs";

export default function Docs() {
  return (
    <CardDocs
      overview="Pesquisa de resultados de diagnóstico precoce infantil (EID) por paciente. Acesso exclusivo a Administradores."
      reading={[
        "Por Nome: nome completo ou parte dele (contém, sem distinção de maiúsculas).",
        "Por US: nome exacto da unidade sanitária requisitante; província, distrito e tipo de laboratório (Convencional ou PoC) são opcionais.",
        "Por Resultado: Positivo, Negativo, Indeterminado, Rejeitada ou Pendente. Estas classes derivam do resultado final (FinalResult) da amostra: Rejeitada é uma amostra com código de rejeição; Pendente é uma amostra sem resultado final.",
        "Data de referência: Registo (por omissão) filtra pela data de registo da amostra; Análise filtra pela data de análise.",
      ]}
      filters={["Editar período: intervalo de datas (por omissão, últimos 12 meses).", "Resultados por página: 50, 100 ou 500.", "Reiniciar o relatório limpa a pesquisa e repõe o período."]}
      endpoint="/patients/{by_name|by_facility|by_result_type}/"
      notes={[
        "Os contactos do cuidador e o PTV da mãe são dados confidenciais: ficam visíveis apenas para Administradores e não são registados em logs.",
        "A opção \"Exportar página para Excel\" inclui apenas a página actual, com o nome completo e os contactos.",
      ]}
    />
  );
}
