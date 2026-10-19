import { CardDocs } from "@/components/card-docs";

export default function Docs() {
  return (
    <CardDocs
      overview="Pesquisa de resultados de carga viral por paciente. Acesso exclusivo a Administradores."
      reading={[
        "Por Nome: nome e/ou apelido (contém, sem distinção de maiúsculas).",
        "Por US: nome exacto da unidade sanitária requisitante; província e distrito são opcionais.",
        "Por Resultado: CV < 1000 ou CV > 1000, pela data de análise.",
        "Por Motivo: motivo do teste, pela data de registo.",
      ]}
      filters={["Editar período: intervalo de datas (por omissão, últimos 12 meses).", "Resultados por página: 50, 100 ou 500.", "Reiniciar o relatório limpa a pesquisa e repõe o período."]}
      endpoint="/patients/{by_name|by_facility|by_result_type|by_test_reason}/"
      notes={["A opção \"Exportar página para Excel\" inclui apenas a página actual."]}
    />
  );
}
