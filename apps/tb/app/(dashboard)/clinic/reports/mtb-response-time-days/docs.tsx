/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { Paper, Typography, Box, List, ListItem, ListItemIcon, ListItemText, Alert } from '@mui/material';
import { AccessTime, BarChart, FileDownload, FilterList, Timeline, Info } from '@mui/icons-material';

export default function Docs() {
  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#009689', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <AccessTime sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Relatório de Tempo de Resposta em Dias
            </Typography>
            <Typography variant="subtitle1">
              Análise detalhada dos tempos de resposta em diferentes etapas do processo laboratorial
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Overview */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Info color="primary" />
          Visão Geral
        </Typography>
        <Typography variant="body1" paragraph>
          Este relatório apresenta uma análise abrangente dos tempos de resposta em diferentes etapas do processo
          laboratorial para testes de tuberculose. O sistema permite visualizar e analisar a performance temporal
          em três intervalos críticos do fluxo de trabalho laboratorial, comparando amostras dentro e fora do alvo
          de tempo definido.
        </Typography>
      </Paper>

      {/* Time Intervals */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Timeline color="primary" />
          Intervalos de Tempo Analisados
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <AccessTime color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Colheita US → Recepção Lab (alvo: ≤ 5 dias)"
              secondary="Tempo entre a colheita da amostra na unidade sanitária e a recepção no laboratório"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <AccessTime color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Colheita US → Validação no Lab (alvo: ≤ 7 dias)"
              secondary="Tempo total entre a colheita na unidade sanitária e a validação do resultado no laboratório"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <AccessTime color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Recepção Lab → Validação no Lab (alvo: ≤ 2 dias)"
              secondary="Tempo entre a recepção da amostra no laboratório e a validação do resultado"
            />
          </ListItem>
        </List>
      </Paper>

      {/* Performance Categories */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BarChart color="primary" />
          Categorias de Performance
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
          <Box sx={{ p: 2, bgcolor: '#009689', color: 'white', borderRadius: 1 }}>
            <Typography variant="h6">Dentro do alvo</Typography>
            <Typography variant="body2">Amostras processadas dentro do tempo alvo do intervalo selecionado</Typography>
          </Box>
          <Box sx={{ p: 2, bgcolor: '#ef4444', color: 'white', borderRadius: 1 }}>
            <Typography variant="h6">Fora do alvo</Typography>
            <Typography variant="body2">Amostras que ultrapassaram o tempo alvo do intervalo selecionado</Typography>
          </Box>
        </Box>
      </Paper>

      {/* Features */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterList color="primary" />
          Funcionalidades Principais
        </Typography>
        <List>
          <ListItem>
            <ListItemIcon>
              <BarChart color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Gráfico de Barras Empilhadas"
              secondary="Visualização clara da distribuição de tempos de resposta por categoria de performance"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <FilterList color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Seleção de Intervalo de Tempo"
              secondary="Combobox para alternar entre diferentes etapas do processo laboratorial"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <Timeline color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Navegação Hierárquica"
              secondary="Drill-down de Província → Distrito → Unidade Sanitária → Dados de Pacientes"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <FileDownload color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Exportação de Dados"
              secondary="Exportação para Excel e imagem PNG com dados detalhados"
            />
          </ListItem>
        </List>
      </Paper>

      {/* Usage Instructions */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Instruções de Uso
        </Typography>
        
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          1. Seleção do Intervalo de Tempo
        </Typography>
        <Typography variant="body2" paragraph>
          Use o combobox no rodapé do cartão para selecionar o intervalo de tempo que deseja analisar. 
          Cada intervalo representa uma etapa específica do processo laboratorial.
        </Typography>

        <Typography variant="h6" gutterBottom>
          2. Alternância entre Variantes
        </Typography>
        <Typography variant="body2" paragraph>
          Use as abas "Ultra" e "XDR" para alternar entre diferentes tipos de testes GeneXpert.
        </Typography>

        <Typography variant="h6" gutterBottom>
          3. Navegação por Drill-down
        </Typography>
        <Typography variant="body2" paragraph>
          Clique nas barras do gráfico para navegar pela hierarquia: Província → Distrito → Unidade Sanitária. 
          No nível de unidade sanitária, o clique abrirá o diálogo de dados de pacientes.
        </Typography>

        <Typography variant="h6" gutterBottom>
          4. Exportação de Dados
        </Typography>
        <Typography variant="body2" paragraph>
          Use os botões de exportação para gerar relatórios em Excel ou imagens PNG do gráfico atual.
        </Typography>

        <Typography variant="h6" gutterBottom>
          5. Reinicialização
        </Typography>
        <Typography variant="body2" paragraph>
          Use o botão "Reiniciar" para voltar à visualização inicial por província.
        </Typography>
      </Paper>

      {/* Technical Notes */}
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Endpoint da API:</strong> /tb/gx/facilities/trl_samples_by_days_tb/
        </Typography>
      </Alert>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Estrutura de Dados:</strong> Cada intervalo possui duas categorias (dentro e fora do alvo).
          Os limiares variam por intervalo: ≤/&gt; 5 dias (Colheita → Recepção), ≤/&gt; 7 dias (Colheita → Validação)
          e ≤/&gt; 2 dias (Recepção → Validação).
        </Typography>
      </Alert>

      <Alert severity="warning">
        <Typography variant="body2">
          <strong>Nota:</strong> Os dados são atualizados automaticamente quando você altera o intervalo 
          de tempo ou navega pela hierarquia. Tempos limite de 60 segundos são aplicados para garantir 
          a responsividade do sistema.
        </Typography>
      </Alert>
    </Box>
  );
}
