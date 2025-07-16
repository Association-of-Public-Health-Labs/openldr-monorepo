import { SimpleLine } from "@repo/design_system/atoms/charts/apex/SimpleLine";

export default function OverviewStatusCards() {
  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Amostras Testadas */}
      <section className="flex-1 flex flex-col gap-6 justify-between rounded-2xl bg-[#00B000]/10 p-6 relative min-w-[220px]">
        <h2 className="font-bold text-lg mb-2">Amostras Testadas</h2>
        <div className="flex justify-between mb-2">
          <div className="flex flex-row justify-start items-center gap-2">
            <div className="font-bold">ULTRA</div>
            <div className="font-bold text-[#00B000]">10590</div>
          </div>
          <div className="flex flex-row justify-end items-center gap-2">
            <div className="font-bold">XDR</div>
            <div className="font-bold text-[#00B000]">20590</div>
          </div>
        </div>
        <div className="flex flex-row items-center justify-between">
          <div className="text-xs mb-2">Últimos 12 meses</div>
          <div className="w-auto h-8 flex items-center justify-center">
            <SimpleLine
              labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]}
              series={[{ name: "Tempo", data: [12, 14, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3] }]}
              width={150}
              height={32}
              colors={["#00B000"]}
            />
          </div>
        </div>
      </section>

      {/* Positividade */}
      <section className="flex-1 flex flex-col justify-between rounded-2xl bg-[#C87102]/10 p-6 relative min-w-[220px]">
        <h2 className="font-bold text-lg mb-2">Positividade</h2>
        <div className="flex justify-between mb-2">
          <div className="flex flex-row justify-start items-center gap-2">
            <div className="font-bold">ULTRA</div>
            <div className="font-bold text-[#C87102]">90%</div>
          </div>
          <div className="flex flex-row justify-end items-center gap-2">
            <div className="font-bold">XDR</div>
            <div className="font-bold text-[#C87102]">89%</div>
          </div>
        </div>
        <div className="flex flex-row items-center justify-between">
          <div className="text-xs mb-2">Últimos 12 meses</div>
          <div className="w-auto h-8 flex items-center justify-center">
            <SimpleLine
              labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]}
              series={[{ name: "Positividade", data: [5, 8, 6, 7, 6, 5, 4, 3, 2, 1, 0, 0] }]}
              width={150}
              height={32}
              colors={["#C87102"]}
            />
          </div>
        </div>
      </section>

      {/* Tempo de Resposta */}
      <section className="flex-1 flex flex-col justify-between rounded-2xl bg-[#39298B]/6 p-6 relative min-w-[220px]">
        <h2 className="font-bold text-lg mb-2">Tempo de Resposta</h2>
        <div className="flex justify-between mb-2">
          <div className="flex flex-row justify-start items-center gap-2">
            <div className="font-bold">ULTRA</div>
            <div className="font-bold text-[#39298B]">16 dias</div>
          </div>
          <div className="flex flex-row justify-end items-center gap-2">
            <div className="font-bold">XDR</div>
            <div className="font-bold text-[#39298B]">13 dias</div>
          </div>
        </div>
        <div className="flex flex-row items-center justify-between">
          <div className="text-xs mb-2">Últimos 12 meses</div>
          <div className="w-auto h-8 flex items-center justify-center">
            <SimpleLine
              labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]}
              series={[{ name: "Tempo", data: [12, 14, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3] }]}
              width={150}
              height={32}
              colors={["#39298B"]}
            />
          </div>
        </div>
      </section>

      {/* Erros / Inválidos */}
      <section className="flex-1 flex flex-col justify-between rounded-2xl bg-[#E10D09]/10 p-6 relative min-w-[220px]">
        <div className="flex justify-between items-start mb-2">
          <h2 className="font-bold text-lg">Erros</h2>
          <h2 className="font-bold text-lg">Inválidos</h2>
        </div>
        <div className="flex justify-between mb-2">
          <div className="flex flex-col items-start gap-2">
            <div className="flex flex-row justify-start items-center gap-2">
              <div className="font-bold">ULTRA</div>
              <div className="font-bold text-[#E10D09]">120</div>
            </div>
            <div className="flex flex-row justify-start items-center gap-2">
              <div className="font-bold">XDR</div>
              <div className="font-bold text-[#E10D09]">82</div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex flex-row justify-start items-center gap-2">
              <div className="font-bold">ULTRA</div>
              <div className="font-bold text-[#E10D09]">662</div>
            </div>
            <div className="flex flex-row justify-start items-center gap-2">
              <div className="font-bold">XDR</div>
              <div className="font-bold text-[#E10D09]">45</div>
            </div>
          </div>
        </div>
        <div className="flex flex-row items-center justify-between">
          <div className="text-xs mb-2">Últimos 12 meses</div>
          <div className="w-auto h-8 flex items-center justify-center">
            <SimpleLine
              labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]}
              series={[{ name: "Tempo", data: [12, 14, 13, 11, 10, 9, 8, 7, 6, 5, 4, 3] }]}
              width={150}
              height={32}
              colors={["#E10D09"]}
            />
          </div>
        </div>
      </section>
    </div>
  );
}