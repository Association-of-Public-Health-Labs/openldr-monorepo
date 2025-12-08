import React from 'react';
import { Typography, Box, Paper, Divider, List, ListItem, ListItemText, Alert } from '@mui/material';
import { ErrorOutline, Timeline, Assessment, Info } from '@mui/icons-material';

function MTBRejectedSamplesByLabAndReasonDocs () {
    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            {/* Header */}
            <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'primary.50' }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <ErrorOutline color="primary" fontSize="large" />
                    <Typography variant="h4" component="h1" color="primary.main" fontWeight="bold">
                        Relatório de Amostras Rejeitadas por Laboratório e Motivo
                    </Typography>
                </Box>
                <Typography variant="h6" color="text.secondary">
                    Documentação Completa do Sistema de Análise Detalhada de Rejeições por Motivo
                </Typography>
            </Paper>

            {/* Overview */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom color="primary.main" fontWeight="bold">
                    📋 Visão Geral
                </Typography>
                <Typography variant="body1" paragraph>
                    O Relatório de Amostras Rejeitadas por Laboratório e Motivo é uma ferramenta avançada 
                    de análise de qualidade que combina dados de rejeição laboratorial com as causas 
                    específicas de cada rejeição. Este relatório permite identificar padrões sistemáticos 
                    de problemas e orientar intervenções direcionadas para melhoria da qualidade.
                </Typography>
                <Typography variant="body1" paragraph>
                    O sistema apresenta dados em formato de gráfico empilhado que mostra simultaneamente 
                    o volume de rejeições por laboratório e a distribuição das diferentes causas de 
                    rejeição, facilitando a identificação de problemas específicos que necessitam de 
                    atenção prioritária.
                </Typography>
            </Paper>

            {/* Rejection Reasons */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom color="primary.main" fontWeight="bold">
                    🔍 Motivos de Rejeição Analisados
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                    <Alert severity="info" sx={{ mb: 3 }}>
                        <Typography variant="body2">
                            O sistema categoriza as rejeições em 11 motivos principais, permitindo 
                            análise detalhada dos problemas mais frequentes em cada laboratório.
                        </Typography>
                    </Alert>

                    <List>
                        <ListItem sx={{ bgcolor: '#ffebee', mb: 1, borderRadius: 1, border: '1px solid #f44336' }}>
                            <ListItemText
                                primary={
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                                        Problemas Pré-Analíticos
                                    </Typography>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        • <strong>Amostra Não Rotulada:</strong> Falta de identificação adequada
                                        <br />
                                        • <strong>Amostra Insuficiente:</strong> Volume inadequado para análise
                                        <br />
                                        • <strong>Amostra Inadequada:</strong> Tipo ou qualidade imprópria
                                        <br />
                                        • <strong>Amostra Não Recebida:</strong> Problemas de transporte/entrega
                                    </Typography>
                                }
                            />
                        </ListItem>

                        <ListItem sx={{ bgcolor: '#fff3e0', mb: 1, borderRadius: 1, border: '1px solid #ff9800' }}>
                            <ListItemText
                                primary={
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#f57c00' }}>
                                        Falhas Técnicas e Operacionais
                                    </Typography>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        • <strong>Falha de Equipamento:</strong> Problemas técnicos do equipamento
                                        <br />
                                        • <strong>Falta de Reagente:</strong> Indisponibilidade de materiais
                                        <br />
                                        • <strong>Erro Técnico:</strong> Falhas no processo laboratorial
                                        <br />
                                        • <strong>Acidente Laboratorial:</strong> Incidentes durante o processamento
                                    </Typography>
                                }
                            />
                        </ListItem>

                        <ListItem sx={{ bgcolor: '#e8f5e8', mb: 1, borderRadius: 1, border: '1px solid #4caf50' }}>
                            <ListItemText
                                primary={
                                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#388e3c' }}>
                                        Outros Motivos
                                    </Typography>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        • <strong>Duplo Registo:</strong> Amostras registadas em duplicado
                                        <br />
                                        • <strong>Nova Colheita:</strong> Necessidade de nova amostra
                                        <br />
                                        • <strong>Outros:</strong> Motivos não categorizados especificamente
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
                    📊 Visualização Empilhada por Motivos
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                    <Alert severity="info" sx={{ mb: 3 }}>
                        <Typography variant="body2">
                            O gráfico empilhado apresenta cada laboratório com segmentos coloridos 
                            representando diferentes motivos de rejeição, permitindo análise visual 
                            dos padrões de problemas específicos.
                        </Typography>
                    </Alert>

                    <List>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary={
                                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                                        Gráfico Empilhado Multi-Categoria
                                    </Typography>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        Cada barra representa um laboratório dividida em segmentos coloridos. 
                                        Cada cor corresponde a um motivo específico de rejeição.
                                    </Typography>
                                }
                            />
                        </ListItem>

                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary={
                                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                                        Análise de Padrões por Motivo
                                    </Typography>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        Identifique quais motivos são mais prevalentes em cada laboratório 
                                        e compare padrões entre diferentes unidades laboratoriais.
                                    </Typography>
                                }
                            />
                        </ListItem>

                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary={
                                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                                        Navegação Hierárquica Detalhada
                                    </Typography>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        Drill-down por província → distrito → laboratório mantendo 
                                        a visualização detalhada dos motivos de rejeição.
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
                    🚀 Funcionalidades Principais
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                    <List>
                        <ListItem>
                            <Timeline sx={{ color: 'primary.main', mr: 2 }} />
                            <ListItemText
                                primary="Análise Detalhada por Motivo"
                                secondary="Visualização simultânea de volume e causas específicas de rejeição por laboratório"
                            />
                        </ListItem>
                        
                        <ListItem>
                            <Assessment sx={{ color: 'primary.main', mr: 2 }} />
                            <ListItemText
                                primary="Gráfico Empilhado Multi-Categoria"
                                secondary="11 categorias de motivos com codificação por cores para fácil identificação"
                            />
                        </ListItem>
                        
                        <ListItem>
                            <Info sx={{ color: 'primary.main', mr: 2 }} />
                            <ListItemText
                                primary="Comparação Sistemática"
                                secondary="Identificação de padrões de problemas específicos entre laboratórios"
                            />
                        </ListItem>
                    </List>
                </Box>
            </Paper>

            {/* Usage Instructions */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom color="primary.main" fontWeight="bold">
                    📖 Como Utilizar
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" gutterBottom color="secondary.main">
                        1. Seleção do Período
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ ml: 2 }}>
                        • Use o filtro de datas para selecionar o período de análise
                        <br />
                        • O subtítulo dinâmico mostra automaticamente o intervalo selecionado em português
                    </Typography>

                    <Typography variant="h6" gutterBottom color="secondary.main">
                        2. Interpretação do Gráfico Empilhado
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ ml: 2 }}>
                        • Cada barra representa um laboratório
                        <br />
                        • Cada segmento colorido representa um motivo específico de rejeição
                        <br />
                        • A altura total mostra o volume total de rejeições
                        <br />
                        • A proporção de cada cor indica a prevalência de cada motivo
                    </Typography>

                    <Typography variant="h6" gutterBottom color="secondary.main">
                        3. Análise de Padrões
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ ml: 2 }}>
                        • Identifique laboratórios com predominância de motivos específicos
                        <br />
                        • Compare padrões entre diferentes laboratórios
                        <br />
                        • Procure motivos recorrentes que indicam problemas sistemáticos
                        <br />
                        • Analise a distribuição geográfica de problemas específicos
                    </Typography>

                    <Typography variant="h6" gutterBottom color="secondary.main">
                        4. Alternância entre Tipos de Teste
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ ml: 2 }}>
                        • <strong>Tab Ultra:</strong> Rejeições do teste Xpert MTB Ultra 6 Cores
                        <br />
                        • <strong>Tab XDR:</strong> Rejeições do teste Xpert MTB XDR 10 Cores
                        <br />
                        • Compare padrões de rejeição entre tipos de teste
                    </Typography>

                    <Typography variant="h6" gutterBottom color="secondary.main">
                        5. Exportação de Dados
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ ml: 2 }}>
                        • <strong>Excel:</strong> Exporta dados detalhados com todos os motivos de rejeição
                        <br />
                        • <strong>Imagem:</strong> Exporta o gráfico empilhado como ficheiro PNG
                    </Typography>
                </Box>
            </Paper>

            {/* Quality Improvement Strategies */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom color="primary.main" fontWeight="bold">
                    🎯 Estratégias de Melhoria por Motivo
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                    <Typography variant="body1" paragraph>
                        Intervenções específicas baseadas nos motivos mais frequentes:
                    </Typography>
                    <List>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Problemas Pré-Analíticos"
                                secondary="Formação em colheita e rotulagem de amostras, melhoria dos procedimentos de transporte"
                            />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Falhas Técnicas"
                                secondary="Manutenção preventiva de equipamentos, gestão de stocks de reagentes, formação técnica"
                            />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Erros Operacionais"
                                secondary="Revisão de procedimentos, implementação de controlos de qualidade, supervisão técnica"
                            />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Problemas Sistemáticos"
                                secondary="Auditoria de processos, implementação de sistemas de gestão da qualidade"
                            />
                        </ListItem>
                    </List>
                </Box>
            </Paper>

            {/* Technical Notes */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom color="primary.main" fontWeight="bold">
                    ⚙️ Notas Técnicas
                </Typography>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                        <strong>Fonte de Dados:</strong> API endpoint `/tb/gx/laboratories/rejected_samples_by_reason/`
                    </Typography>
                </Alert>

                <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                        <strong>Estrutura de Dados:</strong> Dados organizados por laboratório com 11 categorias de motivos de rejeição
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
                    Sistema OpenLDR - Relatório de Amostras Rejeitadas por Laboratório e Motivo
                    <br />
                    Para suporte técnico, contacte a equipa de desenvolvimento
                </Typography>
            </Paper>
        </Box>
    );
};

export default MTBRejectedSamplesByLabAndReasonDocs;