"use client"
import { useAIChat } from "@repo/ai/src/context/ai-chat-provider";
import { MainCard } from "@repo/design_system/app/organisms/cards/MainCard";
import { MixedLineBar } from "@repo/design_system/app/atoms/charts/apex/MixedLineBar";
import { PiMicrosoftExcelLogoFill } from "react-icons/pi";
import { IoImageOutline } from "react-icons/io5";
import { VscDebugRestart } from "react-icons/vsc";
import { HiOutlineDocumentText } from "react-icons/hi";
import { TbMessage2Question } from "react-icons/tb";

export default function DashboardPage() {
  const { openChat } = useAIChat();

  return (
    <div>
      {/* <h1 className="text-2xl font-bold">Dashboard</h1> */}
      <MainCard
        additionalOptions={[
          {
            action: () => {},
            icon: <PiMicrosoftExcelLogoFill size={20} />,
            label: "Exportar para Excel",
            type: "primary"
          },
          {
            action: () => {},
            icon: <IoImageOutline size={20} />,
            label: "Exportar imagem",
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
        chartId="default-chart"
        documentation={<div><h3>Documentation</h3><p>This section contains the documentation for the MainCard component.</p></div>}
        headerProps={{
          sx: {
            padding: 2
          }
        }}
        height="400px"
        id="default-main-card"
        labType="poc"
        loading
        reportType="lab"
        subtitle="This is the subtitle for the main card."
        title="Relatorio de Carga Viral"
        user={{
          email: "john.doe@example.com",
          name: "John Doe"
        }}
        width="100%"
      >
        <div
          style={{
            textAlign: "center"
          }}
        >
          <MixedLineBar
            height={250}
            labels={[
              "January",
              "February",
              "March",
              "April",
              "May"
            ]}
            series={[
              {
                data: [
                  30,
                  40,
                  45,
                  50,
                  49
                ],
                name: "Bar Series",
                type: "bar"
              },
              {
                data: [
                  20,
                  30,
                  35,
                  40,
                  38
                ],
                name: "Line Series",
                type: "line"
              }
            ]}
            width="100%"
          />
        </div>
      </MainCard>
    </div>
  );
}