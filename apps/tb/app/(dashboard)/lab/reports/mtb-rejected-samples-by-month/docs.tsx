import React from 'react';
import { Typography, Box, Paper, Divider, List, ListItem, ListItemText, Alert } from '@mui/material';
import { TrendingDown, Timeline, Assessment, Info } from '@mui/icons-material';

function MTBRejectedSamplesByMonthDocs () {
    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            {/* Header */}
            <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'primary.50' }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <TrendingDown color="primary" fontSize="large" />
                    <Typography variant="h4" component="h1" color="primary.main" fontWeight="bold">
                        Relatório de Amostras Rejeitadas por Mês
                    </Typography>
                </Box>
                <Typography variant="h6" color="text.secondary">
                    Documentação Completa do Sistema de Análise Temporal de Rejeições Laboratoriais
                </Typography>
            </Paper>

            {/* Overview */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom color="primary.main" fontWeight="bold">
                    Visão Geral
                </Typography>
                <Typography variant="body1" paragraph>
                    O Relatório de Amostras Rejeitadas por Mês é uma ferramenta de análise temporal especializada em monitorizar a evolução das taxas de rejeição laboratorial ao longo do tempo. Este relatório permite identificar tendências de melhoria ou deterioração da qualidade laboratorial e avaliar o impacto de intervenções implementadas.
                </Typography>
                <Typography variant="body1" paragraph>
                    O sistema apresenta dados em formato de gráfico de linha temporal que mostra a evolução mensal do número de amostras rejeitadas, facilitando a identificação de padrões sazonais, picos de problemas e tendências de melhoria da qualidade.
                </Typography>
            </Paper>

            {/* Quality Monitoring */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom color="primary.main" fontWeight="bold">
                    Monitorização da Qualidade Temporal
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                    <Alert severity="info" sx={{ mb: 3 }}>
                        <Typography variant="body2">
                            A análise temporal das rejeições permite identificar padrões sistemáticos, avaliar eficácia de melhorias implementadas e antecipar necessidades de intervenção.
                        </Typography>
                    </Alert>

                    <List>
                        <ListItem sx={{ bgcolor: '#ffebee', mb: 1, borderRadius: 1, border: '1px solid #f44336' }}>
                            <ListItemText
                                primary={
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Box
                                            sx={{
                                                width: 16,
                                                height: 16,
                                                backgroundColor: '#f44336',
                                                borderRadius: 0.5
                                            }}
                                        />
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                            Tendências de Deterioração
                                        </Typography>
                                    </Box>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        Identificação precoce de aumentos nas taxas de rejeição que podem indicar problemas emergentes no sistema laboratorial.
                                    </Typography>
                                }
                            />
                        </ListItem>

                        <ListItem sx={{ bgcolor: '#e8f5e8', mb: 1, borderRadius: 1, border: '1px solid #4caf50' }}>
                            <ListItemText
                                primary={
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Box
                                            sx={{
                                                width: 16,
                                                height: 16,
                                                backgroundColor: '#4caf50',
                                                borderRadius: 0.5
                                            }}
                                        />
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                            Tendências de Melhoria
                                        </Typography>
                                    </Box>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        Monitorização de reduções nas taxas de rejeição que demonstram eficácia de medidas de melhoria da qualidade implementadas.
                                    </Typography>
                                }
                            />
                        </ListItem>

                        <ListItem sx={{ bgcolor: '#fff3e0', mb: 1, borderRadius: 1, border: '1px solid #ff9800' }}>
                            <ListItemText
                                primary={
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Box
                                            sx={{
                                                width: 16,
                                                height: 16,
                                                backgroundColor: '#ff9800',
                                                borderRadius: 0.5
                                            }}
                                        />
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                            Padrões Sazonais
                                        </Typography>
                                    </Box>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        Detecção de variações sazonais nas rejeições relacionadas com fatores externos como clima, feriados ou mudanças operacionais.
                                    </Typography>
                                }
                            />
                        </ListItem>
                    </List>
                </Box>
            </Paper>

            {/* Chart Visualization */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom color="primary.main" fontWeight="bold">
                    Visualização Temporal de Rejeições
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                    <Alert severity="info" sx={{ mb: 3 }}>
                        <Typography variant="body2">
                            O gráfico de linha apresenta a evolução mensal das rejeições, permitindo identificar tendências, picos problemáticos e períodos de melhoria da qualidade.
                        </Typography>
                    </Alert>

                    <List>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary={
                                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                                        Gráfico de Linha de Rejeições
                                    </Typography>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        Cada ponto representa o total de amostras rejeitadas num mês específico. A linha conecta os pontos mostrando a tendência temporal das rejeições.
                                    </Typography>
                                }
                            />
                        </ListItem>

                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary={
                                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                                        Análise de Impacto de Intervenções
                                    </Typography>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        Correlacione mudanças na tendência com intervenções específicas implementadas para avaliar sua eficácia na redução de rejeições.
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
                                        Use as tabs Ultra e XDR para comparar tendências temporais de rejeição entre diferentes tecnologias de teste.
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
                                primary="Análise Temporal de Qualidade"
                                secondary="Monitorização da evolução mensal das rejeições com identificação de tendências"
                            />
                        </ListItem>
                        
                        <ListItem>
                            <Assessment sx={{ color: 'primary.main', mr: 2 }} />
                            <ListItemText
                                primary="Gráfico de Linha Interativo"
                                secondary="Visualização clara das tendências temporais de rejeição com pontos mensais"
                            />
                        </ListItem>
                        
                        <ListItem>
                            <Info sx={{ color: 'primary.main', mr: 2 }} />
                            <ListItemText
                                primary="Avaliação de Intervenções"
                                secondary="Correlação de mudanças nas tendências com medidas de melhoria implementadas"
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
                        • Recomenda-se pelo menos 12-24 meses para análise de tendências robustas
                        <br />
                        • O subtítulo dinâmico mostra automaticamente o intervalo selecionado
                    </Typography>

                    <Typography variant="h6" gutterBottom color="secondary.main">
                        2. Interpretação das Tendências
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ ml: 2 }}>
                        • Eixo X: Meses do período selecionado
                        <br />
                        • Eixo Y: Número total de amostras rejeitadas por mês
                        <br />
                        • Linha ascendente: Deterioração da qualidade (mais rejeições)
                        <br />
                        • Linha descendente: Melhoria da qualidade (menos rejeições)
                    </Typography>

                    <Typography variant="h6" gutterBottom color="secondary.main">
                        3. Análise de Padrões Temporais
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ ml: 2 }}>
                        • Identifique picos de rejeição e correlacione com eventos específicos
                        <br />
                        • Procure padrões sazonais recorrentes
                        <br />
                        • Analise períodos de melhoria sustentada
                        <br />
                        • Compare tendências antes e após intervenções
                    </Typography>

                    <Typography variant="h6" gutterBottom color="secondary.main">
                        4. Alternância entre Tipos de Teste
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ ml: 2 }}>
                        • <strong>Tab Ultra:</strong> Tendências de rejeição do teste Xpert MTB Ultra
                        <br />
                        • <strong>Tab XDR:</strong> Tendências de rejeição do teste Xpert MTB XDR
                        <br />
                        • Compare estabilidade e qualidade entre tecnologias
                    </Typography>

                    <Typography variant="h6" gutterBottom color="secondary.main">
                        5. Exportação de Dados
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ ml: 2 }}>
                        • <strong>Excel:</strong> Exporta série temporal completa para análise estatística
                        <br />
                        • <strong>Imagem:</strong> Exporta gráfico de tendências como ficheiro PNG
                    </Typography>
                </Box>
            </Paper>

            {/* Quality Management Applications */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom color="primary.main" fontWeight="bold">
                    Aplicações em Gestão da Qualidade
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                    <Typography variant="body1" paragraph>
                        Este relatório é fundamental para:
                    </Typography>
                    <List>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Monitorização Contínua"
                                secondary="Acompanhamento sistemático da qualidade laboratorial ao longo do tempo"
                            />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Avaliação de Intervenções"
                                secondary="Medição do impacto de formações, mudanças de procedimentos e melhorias implementadas"
                            />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Planeamento Preventivo"
                                secondary="Antecipação de problemas baseada em tendências e implementação de medidas preventivas"
                            />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Relatórios de Desempenho"
                                secondary="Documentação de melhorias para relatórios de qualidade e auditorias"
                            />
                        </ListItem>
                    </List>
                </Box>
            </Paper>

            {/* Trend Analysis Guidelines */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom color="primary.main" fontWeight="bold">
                    Diretrizes para Análise de Tendências
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                            <strong>Atenção:</strong> Variações pontuais podem não ser significativas. Procure tendências consistentes ao longo de vários meses.
                        </Typography>
                    </Alert>

                    <List>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Tendência Ascendente Preocupante"
                                secondary="Aumento consistente por 3+ meses consecutivos requer investigação imediata"
                            />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Tendência Descendente Positiva"
                                secondary="Redução sustentada indica eficácia de medidas de melhoria implementadas"
                            />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Variações Sazonais"
                                secondary="Padrões recorrentes anuais podem ser normais mas devem ser documentados"
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
                        <strong>Fonte de Dados:</strong> API endpoint `/tb/gx/laboratories/rejected_samples_by_month/`
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
                    Sistema OpenLDR - Relatório de Amostras Rejeitadas por Mês
                    <br />
                    Para suporte técnico, contacte a equipa de desenvolvimento
                </Typography>
            </Paper>
        </Box>
    );
};

export default MTBRejectedSamplesByMonthDocs;