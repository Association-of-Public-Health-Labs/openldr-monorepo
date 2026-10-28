import { CardDocs } from "@/components/card-docs";
import { GENDER_COLORS } from "@/lib/eid/series";
import { ENDPOINT } from "./constants";

export default function Docs() {
  return (
    <CardDocs
      overview="Amostras testadas por sexo e resultado, por província, com descida até à unidade sanitária."
      legend={[
        { label: "Masculinos Positivos", color: GENDER_COLORS.malePositive, description: "Sexo masculino, resultado positivo." },
        { label: "Masculinos Negativos", color: GENDER_COLORS.maleNegative, description: "Sexo masculino, resultado negativo." },
        { label: "Femininos Positivos", color: GENDER_COLORS.femalePositive, description: "Sexo feminino, resultado positivo." },
        { label: "Femininos Negativos", color: GENDER_COLORS.femaleNegative, description: "Sexo feminino, resultado negativo." },
      ]}
      reading={[
        "Data de referência: data de análise. As amostras rejeitadas não são excluídas.",
        "Cada coluna tem duas pilhas: Masculino e Feminino, cada uma com Positivos e Negativos.",
        "Todos não envia filtro de tipo; Convencional e PoC filtram por IsPoc. O título indica a categoria seleccionada.",
        "Clique numa barra para descer: província → distrito → unidade sanitária. A lista de pacientes (Administradores) respeita o separador seleccionado e mantém-se ao mudar de separador.",
        "Amostras sem província, distrito ou unidade sanitária registada não aparecem no gráfico; por isso o total da província pode ser superior à soma dos seus distritos.",
      ]}
      filters={[
        "Editar período: intervalo de datas (por omissão, últimos 12 meses).",
        "Reiniciar o relatório volta a Todos e ao nível das províncias.",
      ]}
      endpoint={ENDPOINT}
    />
  );
}
