import { CardDocs } from "@/components/card-docs";
import { GENDER_LEGEND } from "@/lib/eid/legends";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Amostras testadas por sexo e resultado, por província, com descida até à unidade sanitária."
      legend={GENDER_LEGEND}
      reading={[
        "Data de referência: data de análise. As amostras rejeitadas não são excluídas.",
        "Cada coluna tem duas pilhas: Masculino e Feminino, cada uma com Positivos e Negativos.",
        "Todos não envia filtro de tipo; Convencional e PoC filtram por IsPoc. O título indica a categoria seleccionada.",
        "Clique numa barra para descer: província → distrito → unidade sanitária. A lista de pacientes (Administradores) respeita o separador seleccionado e mantém-se ao mudar de separador.",
        "As amostras sem província, distrito ou unidade sanitária registados não são contadas em nenhum nível.",
      ]}
      filters={[
        "Editar período: intervalo de datas (por omissão, últimos 12 meses).",
        "Reiniciar o relatório volta a Todos e ao nível das províncias.",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
