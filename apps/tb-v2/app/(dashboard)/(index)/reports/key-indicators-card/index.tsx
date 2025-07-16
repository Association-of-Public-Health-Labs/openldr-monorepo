"use client"
import { useAIChat } from "@repo/ai/src/context/ai-chat-provider";
import { MainCard } from "@repo/design_system/organisms/cards/MainCard";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { IoImageOutline } from "react-icons/io5";
import { VscDebugRestart } from "react-icons/vsc";
import { HiOutlineDocumentText } from "react-icons/hi";
import { TbMessage2Question } from "react-icons/tb";
import { KeyIndicatorsCard } from "@repo/design_system/organisms/cards/KeyIndicatorsCard";

export default function KeyIndicatorsReport() {

  return (
    <MainCard
      user={{
        email: "john.doe@example.com",
        name: "John Doe"
      }}
      additionalOptions={[
        {
          action: () => {},
          icon: <PiMicrosoftExcelLogoFill size={20} />,
          label: "Exportar para Excel",
          type: "primary"
        },
        {
          action: () => {},
          icon: <VscDebugRestart size={20} />,
          label: "Reiniciar o relatorio",
          type: "primary"
        },
        {
          action: () => {},
          icon: <HiOutlineDocumentText size={20} />,
          label: "Ver a Documentação",
          type: "secondary"
        },
        {
          action: () => {},
          icon: <TbMessage2Question size={20} />,
          label: "Duvidas e Sugestões",
          type: "secondary"
        }
      ]}
      chartId="tb-stacked-chart"
      documentation={<div><h3>Documentation</h3><p>This section contains the documentation for the MainCard component.</p></div>}
      headerProps={{
        sx: {
          padding: 2
        }
      }}
      height="auto"
      id="tb-main-card"
      labType="poc"
      // loading={loading}
      reportType="national"
      subtitle="Últimos 12 meses"
      title="Principais Indicadores das Amostras"
      width="100%"
      handleSubmit={(values) => {
        
      }}
    >

      <KeyIndicatorsCard
        labels={["Todos", "Ultra", "XDR"]}
        columns={[
          'Year',
          'MonthName',
          'Registados',
          'Testados',
          'Rejeitados',
          'Pendentes'
        ]}
        containerProps={{
          sx: {
            margin: 'auto',
            maxWidth: '100%'
          }
        }}
        conventional={[
          {
            MonthName: 'January',
            Pendentes: 40,
            Registados: 200,
            Rejeitados: 10,
            Testados: 150,
            Year: 2023
          },
          {
            MonthName: 'February',
            Pendentes: 45,
            Registados: 180,
            Rejeitados: 15,
            Testados: 120,
            Year: 2023
          }
        ]}
        poc={[
          {
            MonthName: 'January',
            Pendentes: 5,
            Registados: 100,
            Rejeitados: 5,
            Testados: 90,
            Year: 2023
          },
          {
            MonthName: 'February',
            Pendentes: 2,
            Registados: 120,
            Rejeitados: 8,
            Testados: 110,
            Year: 2023
          }
        ]}
      />
    </MainCard>
  );
}