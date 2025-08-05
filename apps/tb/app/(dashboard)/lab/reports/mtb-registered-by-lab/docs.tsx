// import React from "react";

export default function Docs() {
  return (
    <div>
      <p>
        Este relatório apresenta a distribuição das <strong>amostras registadas</strong> para o teste <strong>Xpert MTB Ultra e XDR</strong> por província, com base nos dados dos últimos 12 meses.
      </p>

      <p>
        As barras do gráfico representam o número total de amostras registadas em cada província. Ao interagir com uma barra específica, o gráfico permite <strong>desagregar os dados</strong> e visualizar o número de amostras por <strong>laboratório individual</strong> dentro daquela província.
      </p>

      <p>
        Esta funcionalidade interativa facilita a análise detalhada do volume de testagens por unidade laboratorial, ajudando a identificar:
      </p>

      <ul>
        <li><p><strong>Províncias com maior ou menor carga de amostras registadas.</strong></p></li>
        <li><p><strong>Laboratórios com maior fluxo de testagem dentro de cada província.</strong></p></li>
        <li><p><strong>Possíveis inconsistências de registo, como amostras com localização não especificada.</strong></p></li>
      </ul>

      <p>
        O campo <strong>Not Specified</strong> indica amostras que foram registadas sem atribuição clara a uma província ou laboratório, sendo importante para monitoramento da qualidade dos dados.
      </p>
    </div>
  );
}
