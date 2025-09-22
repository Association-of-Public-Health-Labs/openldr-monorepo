import React from 'react';
import { Paper, Typography, Box, List, ListItem, ListItemIcon, ListItemText, Alert } from '@mui/material';
import { AccessTime, BarChart, FileDownload, FilterList, Timeline, Info } from '@mui/icons-material';

export default function Docs() {
  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'white' }}>
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
          em quatro intervalos críticos do fluxo de trabalho laboratorial.
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
              primary="Colheita US → Recepção Lab"
              secondary="Tempo entre a colheita da amostra na unidade sanitária e a recepção no laboratório"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <AccessTime color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Recepção Lab → Registo no Lab"
              secondary="Tempo entre a recepção da amostra e o seu registo no sistema laboratorial"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <AccessTime color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Registo no Lab → Análise no Lab"
              secondary="Tempo entre o registo da amostra e o início da análise laboratorial"
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <AccessTime color="primary" />
            </ListItemIcon>
            <ListItemText
              primary="Análise no Lab → Validação no Lab"
              secondary="Tempo entre a conclusão da análise e a validação dos resultados"
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
          <Box sx={{ p: 2, bgcolor: '#22c55e', color: 'white', borderRadius: 1 }}>
            <Typography variant="h6">{'< 7 dias'}</Typography>
            <Typography variant="body2">Excelente performance</Typography>
          </Box>
          <Box sx={{ p: 2, bgcolor: '#eab308', color: 'white', borderRadius: 1 }}>
            <Typography variant="h6">7-15 dias</Typography>
            <Typography variant="body2">Performance aceitável</Typography>
          </Box>
          <Box sx={{ p: 2, bgcolor: '#f97316', color: 'white', borderRadius: 1 }}>
            <Typography variant="h6">16-21 dias</Typography>
            <Typography variant="body2">Performance preocupante</Typography>
          </Box>
          <Box sx={{ p: 2, bgcolor: '#ef4444', color: 'white', borderRadius: 1 }}>
            <Typography variant="h6">{"> 21 dias"}</Typography>
            <Typography variant="body2">Performance deficiente</Typography>
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
          <strong>Endpoint da API:</strong> /tb/gx/facilities/trl_samples_by_days/
        </Typography>
      </Alert>

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Estrutura de Dados:</strong> O relatório processa dados com quatro categorias de tempo 
          (less_than_7, between_7_15, between_16_21, greater_than_21) para cada intervalo selecionado.
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
