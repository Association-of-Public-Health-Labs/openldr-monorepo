import React from 'react';
import { Typography, Box, Paper, List, ListItem, ListItemText, Alert } from '@mui/material';

export default function Docs() {
  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'primary.50' }}>
        <Typography variant="h4" color="primary.main" fontWeight="bold">
          Relatório de Tempo de Resposta por Mês
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Documentação do relatório
        </Typography>
      </Paper>

      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom color="primary.main" fontWeight="bold">
          Visão Geral
        </Typography>
        <Typography variant="body1" paragraph>
          Este relatório apresenta o tempo médio de resposta laboratorial (turnaround time) para amostras de TB,
          dividido em quatro fases do processo laboratorial. Os dados são apresentados mensalmente
          num gráfico de barras empilhadas, permitindo visualizar a contribuição de cada fase
          para o tempo total de resposta.
        </Typography>
      </Paper>

      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom color="primary.main" fontWeight="bold">
          Fases do Processo
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="1. Colheita US → Recepção Lab"
              secondary="Tempo entre a colheita da amostra na unidade sanitária e a recepção no laboratório"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="2. Recepção Lab → Registo no Lab"
              secondary="Tempo entre a recepção da amostra e o registo no sistema do laboratório"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="3. Registo no Lab → Análise no Lab"
              secondary="Tempo entre o registo e a realização da análise laboratorial"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="4. Análise no Lab → Validação no Lab"
              secondary="Tempo entre a análise e a validação dos resultados no laboratório"
            />
          </ListItem>
        </List>
      </Paper>

      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom color="primary.main" fontWeight="bold">
          Como Utilizar
        </Typography>
        <List>
          <ListItem>
            <ListItemText
              primary="1. Seleção do Período"
              secondary="Use o filtro de datas para selecionar o período de análise"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="2. Filtro de Localização"
              secondary="Use o seletor de instalações para filtrar por província ou distrito"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="3. Alternância entre Tipos de Teste"
              secondary="Use as tabs Ultra e XDR para alternar entre tipos de teste GeneXpert"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="4. Exportação"
              secondary="Exporte os dados para Excel ou como imagem PNG para relatórios externos"
            />
          </ListItem>
        </List>
      </Paper>

      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom color="primary.main" fontWeight="bold">
          Notas Técnicas
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Fonte de Dados:</strong> API endpoint {' '}
            <code>/tb/gx/facilities/trl_samples_avg_by_days_by_month/</code>
          </Typography>
        </Alert>
        <Alert severity="info">
          <Typography variant="body2">
            <strong>Valores:</strong> Os dados representam a média de dias em cada fase do processo laboratorial,
            agrupados por intervalos (menos de 7 dias, 7-15 dias, 16-21 dias, mais de 21 dias).
          </Typography>
        </Alert>
      </Paper>
    </Box>
  );
}
