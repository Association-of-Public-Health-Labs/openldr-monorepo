import { ColorDisplay } from "@repo/design_system/app/atoms/utils/ColorDisplay";

export default function Docs() {
  return (
    <div>
      <p>
        Este relatório apresenta a <strong>positividade do Mycobacterium tuberculosis (MTB)</strong> nos testes <strong>Xpert MTB</strong>, com visualização em formato de <strong>mapa de calor</strong> por província, ao longo dos últimos 12 meses.
      </p>

      <p>O relatório está dividido em duas abas:</p>

      <ul>
        <li>
          <ColorDisplay color="#00B000" />
          <p><strong>Ultra (verde):</strong> Mostra a taxa de positividade nos testes realizados com o protocolo <strong>Xpert MTB Ultra</strong>. A intensidade do verde indica o nível de positividade por província — de 0% (verde claro) a 100% (verde escuro).</p>
        </li>
        <li>
          <ColorDisplay color="#fd9a00" />
          <p><strong>XDR (laranja):</strong> Mostra a taxa de positividade nos testes para detecção de resistência extensiva (XDR-TB). A intensidade do laranja representa a proporção de casos positivos — de 0% (laranja claro) a 100% (laranja escuro).</p>
        </li>
      </ul>

      <p>
        Esta visualização permite identificar as províncias com maiores taxas de positividade para TB sensível e resistente.
      </p>
    </div>
  );
}
