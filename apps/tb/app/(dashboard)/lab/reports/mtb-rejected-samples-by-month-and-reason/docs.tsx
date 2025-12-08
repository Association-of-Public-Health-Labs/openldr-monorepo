import React from 'react';
import { Typography, Box, Paper, Divider, List, ListItem, ListItemText, Alert } from '@mui/material';
import { TrendingDown, Timeline, BarChart, ErrorOutline } from '@mui/icons-material';

function MTBRejectedSamplesByMonthAndReasonDocs () {
    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            {/* Header */}
            <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'primary.50' }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <BarChart color="primary" fontSize="large" />
                    <Typography variant="h4" component="h1" color="primary.main" fontWeight="bold">
                        Relatório de Amostras Rejeitadas por Mês e Motivo
                    </Typography>
                </Box>
                <Typography variant="h6" color="text.secondary">
                    Documentação Completa do Sistema de Análise Temporal Detalhada de Rejeições Laboratoriais
                </Typography>
            </Paper>

            {/* Overview */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom color="primary.main" fontWeight="bold">
                    Visão Geral
                </Typography>
                <Typography variant="body1" paragraph>
                    O Relatório de Amostras Rejeitadas por Mês e Motivo combina análise temporal com 
                    categorização detalhada dos motivos de rejeição. Esta ferramenta avançada permite 
                    identificar não apenas quando ocorrem picos de rejeição, mas também quais são as 
                    causas específicas, facilitando intervenções direcionadas e eficazes.
                </Typography>
                <Typography variant="body1" paragraph>
                    O sistema apresenta dados em formato de gráfico de barras empilhadas que mostra 
                    a evolução mensal das rejeições segmentada por motivo, permitindo análise 
                    simultânea de tendências temporais e padrões de causas específicas.
                </Typography>
            </Paper>

            {/* Detailed Analysis */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom color="primary.main" fontWeight="bold">
                    Análise Detalhada por Motivo e Tempo
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                    <Alert severity="info" sx={{ mb: 3 }}>
                        <Typography variant="body2">
                            A combinação de análise temporal com categorização de motivos permite 
                            identificar padrões específicos e implementar soluções direcionadas.
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
                                            Problemas de Colheita
                                        </Typography>
                                    </Box>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        Amostra insuficiente, contaminação, recipiente inadequado - 
                                        requer formação em técnicas de colheita.
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
                                            Problemas de Transporte
                                        </Typography>
                                    </Box>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        Demora excessiva, temperatura inadequada, derramamento - 
                                        requer melhoria da cadeia de frio e logística.
                                    </Typography>
                                }
                            />
                        </ListItem>

                        <ListItem sx={{ bgcolor: '#e3f2fd', mb: 1, borderRadius: 1, border: '1px solid #2196f3' }}>
                            <ListItemText
                                primary={
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Box
                                            sx={{
                                                width: 16,
                                                height: 16,
                                                backgroundColor: '#2196f3',
                                                borderRadius: 0.5
                                            }}
                                        />
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                            Problemas Laboratoriais
                                        </Typography>
                                    </Box>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        Falha de equipamento, erro de processamento, controlo de qualidade - 
                                        requer manutenção e formação técnica.
                                    </Typography>
                                }
                            />
                        </ListItem>

                        <ListItem sx={{ bgcolor: '#f3e5f5', mb: 1, borderRadius: 1, border: '1px solid #9c27b0' }}>
                            <ListItemText
                                primary={
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Box
                                            sx={{
                                                width: 16,
                                                height: 16,
                                                backgroundColor: '#9c27b0',
                                                borderRadius: 0.5
                                            }}
                                        />
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                            Problemas Administrativos
                                        </Typography>
                                    </Box>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        Identificação incorreta, formulário incompleto, dados em falta - 
                                        requer melhoria de procedimentos administrativos.
                                    </Typography>
                                }
                            />
                        </ListItem>
                    </List>
                </Box>
            </Paper>

            {/* Stacked Chart Visualization */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom color="primary.main" fontWeight="bold">
                    Visualização em Gráfico de Barras Empilhadas
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                    <Alert severity="info" sx={{ mb: 3 }}>
                        <Typography variant="body2">
                            O gráfico de barras empilhadas mostra a evolução temporal das rejeições 
                            com cada segmento representando um motivo específico de rejeição.
                        </Typography>
                    </Alert>

                    <List>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary={
                                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                                        Análise de Composição Temporal
                                    </Typography>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        Cada barra representa um mês, com segmentos coloridos mostrando 
                                        a contribuição de cada motivo de rejeição para o total mensal.
                                    </Typography>
                                }
                            />
                        </ListItem>

                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary={
                                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                                        Identificação de Padrões Específicos
                                    </Typography>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        Observe se determinados motivos aumentam em períodos específicos, 
                                        indicando problemas sazonais ou sistemáticos.
                                    </Typography>
                                }
                            />
                        </ListItem>

                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary={
                                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                                        Avaliação de Eficácia de Intervenções
                                    </Typography>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        Correlacione reduções em motivos específicos com intervenções 
                                        direcionadas implementadas (formações, melhorias de equipamento).
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
                                secondary="Evolução mensal das rejeições segmentada por motivo específico"
                            />
                        </ListItem>
                        
                        <ListItem>
                            <BarChart sx={{ color: 'primary.main', mr: 2 }} />
                            <ListItemText
                                primary="Gráfico de Barras Empilhadas"
                                secondary="Visualização clara da composição de motivos ao longo do tempo"
                            />
                        </ListItem>
                        
                        <ListItem>
                            <ErrorOutline sx={{ color: 'primary.main', mr: 2 }} />
                            <ListItemText
                                primary="Categorização de Problemas"
                                secondary="Identificação específica de causas para intervenções direcionadas"
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
                        1. Configuração do Período de Análise
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ ml: 2 }}>
                        • Selecione um período de pelo menos 6-12 meses para análise robusta
                        <br />
                        • Use filtros de data para focar em períodos específicos de interesse
                        <br />
                        • O subtítulo dinâmico mostra automaticamente o intervalo selecionado
                    </Typography>

                    <Typography variant="h6" gutterBottom color="secondary.main">
                        2. Interpretação do Gráfico Empilhado
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ ml: 2 }}>
                        • Eixo X: Meses do período selecionado
                        <br />
                        • Eixo Y: Número total de amostras rejeitadas
                        <br />
                        • Segmentos coloridos: Cada cor representa um motivo específico
                        <br />
                        • Altura total da barra: Total de rejeições no mês
                    </Typography>

                    <Typography variant="h6" gutterBottom color="secondary.main">
                        3. Análise de Padrões por Motivo
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ ml: 2 }}>
                        • Identifique motivos que dominam em períodos específicos
                        <br />
                        • Procure correlações entre motivos e épocas do ano
                        <br />
                        • Analise se intervenções reduziram motivos específicos
                        <br />
                        • Compare proporções relativas entre diferentes motivos
                    </Typography>

                    <Typography variant="h6" gutterBottom color="secondary.main">
                        4. Comparação entre Tipos de Teste
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ ml: 2 }}>
                        • <strong>Tab Ultra:</strong> Padrões de rejeição por motivo no teste Ultra
                        <br />
                        • <strong>Tab XDR:</strong> Padrões de rejeição por motivo no teste XDR
                        <br />
                        • Compare se diferentes tecnologias têm motivos de rejeição distintos
                    </Typography>

                    <Typography variant="h6" gutterBottom color="secondary.main">
                        5. Planeamento de Intervenções
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ ml: 2 }}>
                        • Identifique os motivos mais frequentes para priorização
                        <br />
                        • Correlacione picos com eventos específicos (formações, mudanças)
                        <br />
                        • Use dados para justificar necessidades de recursos específicos
                    </Typography>
                </Box>
            </Paper>

            {/* Quality Improvement Strategies */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom color="primary.main" fontWeight="bold">
                    Estratégias de Melhoria da Qualidade
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                    <Typography variant="body1" paragraph>
                        Baseado na análise temporal por motivo, implemente estratégias específicas:
                    </Typography>
                    <List>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Formação Direcionada"
                                secondary="Desenvolva programas de formação específicos para os motivos mais frequentes identificados"
                            />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Melhoria de Processos"
                                secondary="Revise e otimize procedimentos relacionados com motivos recorrentes"
                            />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Investimento em Equipamento"
                                secondary="Justifique aquisições baseadas em motivos técnicos identificados"
                            />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Monitorização Preventiva"
                                secondary="Estabeleça alertas para motivos que mostram tendências crescentes"
                            />
                        </ListItem>
                    </List>
                </Box>
            </Paper>

            {/* Trend Analysis Guidelines */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom color="primary.main" fontWeight="bold">
                    Diretrizes para Análise de Tendências por Motivo
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                            <strong>Atenção:</strong> Analise tanto as tendências totais quanto as 
                            proporções relativas de cada motivo para obter insights completos.
                        </Typography>
                    </Alert>

                    <List>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Motivo Dominante Crescente"
                                secondary="Se um motivo específico representa >50% das rejeições e está a aumentar, requer ação imediata"
                            />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Diversificação de Problemas"
                                secondary="Múltiplos motivos com proporções similares podem indicar problemas sistémicos generalizados"
                            />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Padrões Sazonais por Motivo"
                                secondary="Alguns motivos podem ter variações sazonais previsíveis que requerem preparação"
                            />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Sucesso de Intervenções"
                                secondary="Reduções consistentes em motivos específicos confirmam eficácia de medidas implementadas"
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
                        <strong>Fonte de Dados:</strong> API endpoint `/tb/gx/laboratories/rejected_samples_by_month_and_reason/`
                    </Typography>
                </Alert>

                <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                        <strong>Estrutura de Dados:</strong> Dados agregados mensalmente com categorização detalhada por motivo de rejeição
                    </Typography>
                </Alert>

                <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                        <strong>Timeout:</strong> Consultas complexas têm limite de 60 segundos com retry automático
                    </Typography>
                </Alert>

                <Alert severity="success">
                    <Typography variant="body2">
                        <strong>Actualização:</strong> Dados actualizados automaticamente com mudanças de filtros ou tabs
                    </Typography>
                </Alert>
            </Paper>

            {/* Footer */}
            <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50', textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    Sistema OpenLDR - Relatório de Amostras Rejeitadas por Mês e Motivo
                    <br />
                    Para suporte técnico, contacte a equipa de desenvolvimento
                </Typography>
            </Paper>
        </Box>
    );
};

export default MTBRejectedSamplesByMonthAndReasonDocs;