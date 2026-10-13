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
      filters={["Intervalo de datas (botão Editar; por omissão, últimos 12 meses).", "Resultados por página: 50, 100 ou 500."]}
      endpoint="/patients/{by_name|by_facility|by_result_type|by_test_reason}/"
      notes={["A exportação Excel inclui a página actual."]}
    />
  );
}
