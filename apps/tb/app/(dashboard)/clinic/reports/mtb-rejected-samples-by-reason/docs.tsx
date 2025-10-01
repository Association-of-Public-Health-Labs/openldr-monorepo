import React from 'react';
import { Typography, Box, Paper, Divider, List, ListItem, ListItemText, Alert } from '@mui/material';
import { ErrorOutline, Timeline, Assessment, Info } from '@mui/icons-material';

const MTBRejectedSamplesByReasonDocs: React.FC = () => {
    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            {/* Header */}
            <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'primary.50' }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <ErrorOutline color="primary" fontSize="large" />
                    <Typography variant="h5" component="h1" color="#009689" fontWeight="bold">
                        Relatório de Amostras Rejeitadas por Motivo
                    </Typography>
                </Box>
                <Typography variant="h6" color="text.secondary">
                    Documentação Completa do Sistema de Análise de Amostras Rejeitadas por Motivo de Rejeição
                </Typography>
            </Paper>

            {/* Overview */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom color="#009689" fontWeight="bold">
                    📋 Visão Geral
                </Typography>
                <Typography variant="body1" paragraph>
                    O Relatório de Amostras Rejeitadas por Motivo é uma ferramenta avançada para análise detalhada 
                    dos motivos específicos de rejeição de amostras no sistema de diagnóstico de tuberculose. 
                    Este relatório permite identificar padrões sistemáticos e implementar melhorias direcionadas 
                    nos processos de qualidade.
                </Typography>
                <Typography variant="body1" paragraph>
                    O sistema apresenta dados em formato de gráfico empilhado que mostra a distribuição dos 
                    diferentes motivos de rejeição por unidade sanitária, facilitando a identificação de 
                    problemas específicos e oportunidades de formação.
                </Typography>
            </Paper>

            {/* Rejection Categories */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom color="#009689" fontWeight="bold">
                    🔍 Categorias de Rejeição
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                    <Alert severity="info" sx={{ mb: 3 }}>
                        <Typography variant="body2">
                            O sistema categoriza as rejeições em 11 motivos específicos, cada um com cor própria 
                            no gráfico empilhado para facilitar a identificação.
                        </Typography>
                    </Alert>

                    <List>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary={
                                    <Typography variant="h6" color="#009689" fontWeight="bold">
                                        Problemas de Colheita
                                    </Typography>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        • Amostra Insuficiente: Volume inadequado para análise
                                        <br />
                                        • Amostra Inadequada para Teste: Qualidade imprópria
                                        <br />
                                        • Amostra Não Etiquetada: Falta de identificação
                                    </Typography>
                                }
                            />
                        </ListItem>

                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary={
                                    <Typography variant="h6" color="#009689" fontWeight="bold">
                                        Problemas de Transporte
                                    </Typography>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        • Amostra Não Recebida: Perda durante transporte
                                        <br />
                                        • Amostra Repetida: Duplicação no envio
                                    </Typography>
                                }
                            />
                        </ListItem>

                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary={
                                    <Typography variant="h6" color="#009689" fontWeight="bold">
                                        Problemas Laboratoriais
                                    </Typography>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        • Falha de Equipamento: Problemas técnicos
                                        <br />
                                        • Acidente no Laboratório: Incidentes durante processamento
                                        <br />
                                        • Reagente Ausente: Falta de materiais
                                        <br />
                                        • Erro Técnico: Falhas no procedimento
                                        <br />
                                        • Duplicação de Registo: Erro administrativo
                                        <br />
                                        • Outro: Motivos não categorizados
                                    </Typography>
                                }
                            />
                        </ListItem>
                    </List>
                </Box>
            </Paper>

            {/* Chart Visualization */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom color="#009689" fontWeight="bold">
                    📊 Visualização de Dados
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                    <List>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary={
                                    <Typography variant="h6" color="#009689" fontWeight="bold">
                                        Gráfico Empilhado
                                    </Typography>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        Cada barra representa uma unidade sanitária com segmentos coloridos mostrando 
                                        a proporção de cada motivo de rejeição. Permite comparação visual entre unidades.
                                    </Typography>
                                }
                            />
                        </ListItem>

                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary={
                                    <Typography variant="h6" color="#009689" fontWeight="bold">
                                        Navegação Hierárquica
                                    </Typography>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        Clique numa barra para fazer drill-down: Província → Distrito → Unidade Sanitária → 
                                        Dados de Pacientes com motivos específicos de rejeição.
                                    </Typography>
                                }
                            />
                        </ListItem>
                    </List>
                </Box>
            </Paper>

            {/* Features */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom color="#009689" fontWeight="bold">
                    🚀 Funcionalidades Principais
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                    <List>
                        <ListItem>
                            <Timeline sx={{ color: '#009689', mr: 2 }} />
                            <ListItemText
                                primary="Análise Hierárquica"
                                secondary="Navegação por província → distrito → unidade sanitária → dados de pacientes"
                            />
                        </ListItem>
                        
                        <ListItem>
                            <Assessment sx={{ color: '#009689', mr: 2 }} />
                            <ListItemText
                                primary="Gráfico Empilhado Interativo"
                                secondary="Visualização detalhada dos motivos de rejeição com 11 categorias específicas"
                            />
                        </ListItem>
                        
                        <ListItem>
                            <Info sx={{ color: '#009689', mr: 2 }} />
                            <ListItemText
                                primary="Análise de Qualidade"
                                secondary="Identificação de padrões sistemáticos para melhoria de processos"
                            />
                        </ListItem>
                    </List>
                </Box>
            </Paper>

            {/* Usage Instructions */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom color="#009689" fontWeight="bold">
                    📖 Como Utilizar
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                    <Typography variant="h6" gutterBottom color="#009689">
                        1. Seleção do Período
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ ml: 2 }}>
                        • Use o filtro de datas para selecionar o período de análise
                        <br />
                        • O subtítulo dinâmico mostra automaticamente o intervalo selecionado em português
                    </Typography>

                    <Typography variant="h6" gutterBottom color="#009689">
                        2. Interpretação do Gráfico
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ ml: 2 }}>
                        • Cada cor representa um motivo específico de rejeição
                        <br />
                        • A altura total da barra mostra o volume total de rejeições
                        <br />
                        • A proporção de cada segmento indica a frequência relativa de cada motivo
                    </Typography>

                    <Typography variant="h6" gutterBottom color="#009689">
                        3. Navegação Hierárquica
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ ml: 2 }}>
                        • Clique numa barra para fazer drill-down nos dados
                        <br />
                        • Sequência: Província → Distrito → Unidade Sanitária → Diálogo de Pacientes
                        <br />
                        • Use o botão "Reiniciar" para voltar à vista inicial
                    </Typography>

                    <Typography variant="h6" gutterBottom color="#009689">
                        4. Exportação de Dados
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ ml: 2 }}>
                        • <strong>Excel:</strong> Exporta dados com todas as categorias de rejeição
                        <br />
                        • <strong>Imagem:</strong> Exporta o gráfico empilhado como ficheiro PNG
                    </Typography>
                </Box>
            </Paper>

            {/* Technical Notes */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom color="#009689" fontWeight="bold">
                    ⚙️ Notas Técnicas
                </Typography>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                        <strong>Fonte de Dados:</strong> API endpoint `/tb/gx/facilities/rejected_samples_by_reason/`
                    </Typography>
                </Alert>

                <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                        <strong>Estrutura de Dados:</strong> 11 categorias de rejeição organizadas por níveis administrativos
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
                    Sistema OpenLDR - Relatório de Amostras Rejeitadas por Motivo
                    <br />
                    Para suporte técnico, contacte a equipa de desenvolvimento
                </Typography>
            </Paper>
        </Box>
    );
};

export default MTBRejectedSamplesByReasonDocs;
