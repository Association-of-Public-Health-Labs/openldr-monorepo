import React from 'react';
import { Typography, Box, Paper, Divider, List, ListItem, ListItemText, Alert } from '@mui/material';
import { DateRange, Timeline, Assessment, Info } from '@mui/icons-material';

function MTBRegisteredByMonthDocs () {
    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            {/* Header */}
            <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'primary.50' }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <DateRange color="primary" fontSize="large" />
                    <Typography variant="h4" component="h1" color="primary.main" fontWeight="bold">
                        Relatório de Amostras Registadas por Mês
                    </Typography>
                </Box>
                <Typography variant="h6" color="text.secondary">
                    Documentação Completa do Sistema de Análise Temporal de Amostras Registadas
                </Typography>
            </Paper>

            {/* Overview */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom color="primary.main" fontWeight="bold">
                    Visão Geral
                </Typography>
                <Typography variant="body1" paragraph>
                    O Relatório de Amostras Registadas por Mês é uma ferramenta de análise temporal que 
                    monitoriza o volume de amostras de tuberculose registadas mensalmente no sistema 
                    laboratorial. Este relatório permite identificar tendências sazonais, padrões de 
                    crescimento e variações na capacidade de registo ao longo do tempo.
                </Typography>
                <Typography variant="body1" paragraph>
                    O sistema apresenta dados em formato de gráfico de linha temporal que mostra a 
                    evolução mensal do número de amostras registadas, facilitando a análise de 
                    tendências e a identificação de períodos com maior ou menor atividade laboratorial.
                </Typography>
            </Paper>

            {/* Chart Visualization */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom color="primary.main" fontWeight="bold">
                    Visualização Temporal
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                    <Alert severity="info" sx={{ mb: 3 }}>
                        <Typography variant="body2">
                            O gráfico de linha apresenta a evolução mensal do número de amostras registadas, 
                            permitindo identificar tendências, sazonalidade e variações na atividade laboratorial.
                        </Typography>
                    </Alert>

                    <List>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary={
                                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                                        Gráfico de Linha Temporal
                                    </Typography>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        Cada ponto representa o total de amostras registadas num mês específico. 
                                        A linha conecta os pontos mostrando a tendência temporal.
                                    </Typography>
                                }
                            />
                        </ListItem>

                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary={
                                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                                        Análise de Tendências
                                    </Typography>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        Identifique padrões sazonais, crescimento ou declínio na atividade 
                                        laboratorial, e períodos de maior demanda de testagens.
                                    </Typography>
                                }
                            />
                        </ListItem>

                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary={
                                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                                        Comparação entre Tipos de Teste
                                    </Typography>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        Use as tabs Ultra e XDR para comparar tendências temporais entre 
                                        diferentes tipos de teste Xpert MTB.
                                    </Typography>
                                }
                            />
                        </ListItem>
                    </List>
                </Box>
            </Paper>

            {/* Features */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom color="primary.main" fontWeight="bold">
                    Funcionalidades Principais
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                    <List>
                        <ListItem>
                            <Timeline sx={{ color: 'primary.main', mr: 2 }} />
                            <ListItemText
                                primary="Análise Temporal Detalhada"
                                secondary="Visualização da evolução mensal com identificação de tendências e sazonalidade"
                            />
                        </ListItem>
                        
                        <ListItem>
                            <Assessment sx={{ color: 'primary.main', mr: 2 }} />
                            <ListItemText
                                primary="Gráfico de Linha Interativo"
                                secondary="Visualização clara das tendências temporais com pontos de dados mensais"
                            />
                        </ListItem>
                        
                        <ListItem>
                            <Info sx={{ color: 'primary.main', mr: 2 }} />
                            <ListItemText
                                primary="Comparação de Tipos de Teste"
                                secondary="Análise separada para testes Ultra e XDR com alternância de tabs"
                            />
                        </ListItem>
                    </List>
                </Box>
            </Paper>

            {/* Usage Instructions */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom color="primary.main" fontWeight="bold">
                    Como Utilizar
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" gutterBottom color="secondary.main">
                        1. Seleção do Período
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ ml: 2 }}>
                        • Use o filtro de datas para selecionar o período de análise temporal
                        <br />
                        • O subtítulo dinâmico mostra automaticamente o intervalo selecionado em português
                        <br />
                        • Recomenda-se selecionar pelo menos 12 meses para análise de sazonalidade
                    </Typography>

                    <Typography variant="h6" gutterBottom color="secondary.main">
                        2. Alternância entre Tipos de Teste
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ ml: 2 }}>
                        • <strong>Tab Ultra:</strong> Tendências temporais do teste Xpert MTB Ultra 6 Cores
                        <br />
                        • <strong>Tab XDR:</strong> Tendências temporais do teste Xpert MTB XDR 10 Cores
                        <br />
                        • Compare as tendências entre os dois tipos de teste
                    </Typography>

                    <Typography variant="h6" gutterBottom color="secondary.main">
                        3. Interpretação do Gráfico
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ ml: 2 }}>
                        • Eixo X: Meses do período selecionado
                        <br />
                        • Eixo Y: Número total de amostras registadas por mês
                        <br />
                        • Linha: Conecta os pontos mensais mostrando a tendência temporal
                        <br />
                        • Pontos: Representam o valor exato de cada mês
                    </Typography>

                    <Typography variant="h6" gutterBottom color="secondary.main">
                        4. Análise de Padrões
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ ml: 2 }}>
                        • Identifique tendências de crescimento ou declínio
                        <br />
                        • Procure padrões sazonais recorrentes
                        <br />
                        • Compare períodos de alta e baixa atividade
                        <br />
                        • Analise impactos de eventos específicos
                    </Typography>

                    <Typography variant="h6" gutterBottom color="secondary.main">
                        5. Exportação de Dados
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ ml: 2 }}>
                        • <strong>Excel:</strong> Exporta dados mensais numa folha de cálculo formatada
                        <br />
                        • <strong>Imagem:</strong> Exporta o gráfico temporal como ficheiro PNG
                    </Typography>
                </Box>
            </Paper>

            {/* Temporal Analysis Applications */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom color="primary.main" fontWeight="bold">
                    Aplicações da Análise Temporal
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                    <Typography variant="body1" paragraph>
                        Este relatório é fundamental para:
                    </Typography>
                    <List>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Planeamento de Recursos"
                                secondary="Antecipação de períodos de maior demanda para alocação adequada de recursos laboratoriais"
                            />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Identificação de Sazonalidade"
                                secondary="Detecção de padrões sazonais na incidência de TB e ajuste de estratégias preventivas"
                            />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Monitorização de Programas"
                                secondary="Avaliação do impacto de campanhas de saúde pública e programas de controlo de TB"
                            />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Análise de Capacidade"
                                secondary="Monitorização da capacidade do sistema laboratorial ao longo do tempo"
                            />
                        </ListItem>
                    </List>
                </Box>
            </Paper>

            {/* Seasonal Patterns */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom color="primary.main" fontWeight="bold">
                    Padrões Sazonais Comuns
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                            <strong>Nota Epidemiológica:</strong> A tuberculose pode apresentar variações sazonais 
                            relacionadas com fatores climáticos, sociais e comportamentais.
                        </Typography>
                    </Alert>

                    <List>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Picos de Inverno"
                                secondary="Possível aumento de casos durante meses mais frios devido a maior aglomeração em espaços fechados"
                            />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Variações Festivas"
                                secondary="Flutuações durante períodos de festividades e feriados que podem afetar o acesso aos cuidados"
                            />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Impactos Socioeconómicos"
                                secondary="Correlação com períodos de maior vulnerabilidade socioeconómica e migração populacional"
                            />
                        </ListItem>
                    </List>
                </Box>
            </Paper>

            {/* Technical Notes */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom color="primary.main" fontWeight="bold">
                    Notas Técnicas
                </Typography>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                        <strong>Fonte de Dados:</strong> API endpoint `/tb/gx/laboratories/registered_samples_by_month/`
                    </Typography>
                </Alert>

                <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                        <strong>Agregação Temporal:</strong> Dados agregados mensalmente com suporte para análise de tendências
                    </Typography>
                </Alert>

                <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                        <strong>Timeout:</strong> As consultas têm um limite de 60 segundos com mecanismo de retry automático
                    </Typography>
                </Alert>

                <Alert severity="success">
                    <Typography variant="body2">
                        <strong>Actualização:</strong> Os dados são actualizados automaticamente quando se altera qualquer filtro ou tab
                    </Typography>
                </Alert>
            </Paper>

            {/* Footer */}
            <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50', textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    Sistema OpenLDR - Relatório de Amostras Registadas por Mês
                    <br />
                    Para suporte técnico, contacte a equipa de desenvolvimento
                </Typography>
            </Paper>
        </Box>
    );
};

export default MTBRegisteredByMonthDocs;