/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { Typography, Box, Paper, Divider, List, ListItem, ListItemText, Alert } from '@mui/material';
import { Cancel, Timeline, Assessment, Info } from '@mui/icons-material';

function MTBRejectedSamplesByLabDocs () {
    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            {/* Header */}
            <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'primary.50' }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Cancel color="primary" fontSize="large" />
                    <Typography variant="h4" component="h1" color="primary.main" fontWeight="bold">
                        Relatório de Amostras Rejeitadas por Laboratório
                    </Typography>
                </Box>
                <Typography variant="h6" color="text.secondary">
                    Documentação Completa do Sistema de Análise de Amostras Rejeitadas por Laboratório
                </Typography>
            </Paper>

            {/* Overview */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom color="primary.main" fontWeight="bold">
                    Visão Geral
                </Typography>
                <Typography variant="body1" paragraph>
                    O Relatório de Amostras Rejeitadas por Laboratório é uma ferramenta essencial para
                    monitorização da qualidade laboratorial e identificação de problemas sistemáticos
                    no processamento de amostras de tuberculose. Este relatório permite acompanhar as
                    taxas de rejeição por laboratório e identificar oportunidades de melhoria.
                </Typography>
                <Typography variant="body1" paragraph>
                    O sistema apresenta dados hierárquicos que mostram o número total de amostras
                    rejeitadas por laboratório, facilitando a comparação de desempenho entre diferentes
                    unidades laboratoriais e a identificação de laboratórios que necessitam de
                    intervenções específicas.
                </Typography>
            </Paper>

            {/* Quality Indicators */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom color="primary.main" fontWeight="bold">
                    Indicadores de Qualidade
                </Typography>

                <Box sx={{ mt: 2 }}>
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        <Typography variant="body2">
                            As amostras rejeitadas representam falhas no processo laboratorial que podem
                            afetar a qualidade do diagnóstico e causar atrasos no tratamento dos pacientes.
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
                                            Taxa de Rejeição
                                        </Typography>
                                    </Box>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        Percentagem de amostras rejeitadas em relação ao total processado.
                                        Taxas elevadas podem indicar problemas de qualidade ou procedimentos.
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
                                            Comparação entre Laboratórios
                                        </Typography>
                                    </Box>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        Identificação de laboratórios com taxas de rejeição superiores à média,
                                        permitindo intervenções direcionadas de melhoria da qualidade.
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
                                            Tendências Temporais
                                        </Typography>
                                    </Box>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        Monitorização da evolução das taxas de rejeição ao longo do tempo
                                        para avaliar a eficácia de medidas de melhoria implementadas.
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
                    Visualização de Dados
                </Typography>

                <Box sx={{ mt: 2 }}>
                    <Alert severity="info" sx={{ mb: 3 }}>
                        <Typography variant="body2">
                            O gráfico de barras apresenta o número total de amostras rejeitadas por laboratório,
                            facilitando a identificação de unidades com maiores problemas de qualidade.
                        </Typography>
                    </Alert>

                    <List>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary={
                                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                                        Gráfico de Barras por Laboratório
                                    </Typography>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        Cada barra representa um laboratório com o número total de amostras
                                        rejeitadas. Barras mais altas indicam maior número de rejeições.
                                    </Typography>
                                }
                            />
                        </ListItem>

                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary={
                                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                                        Navegação Hierárquica
                                    </Typography>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        Clique numa barra para fazer drill-down nos dados
                                        <br />
                                        Sequência: Província → Distrito → Laboratório → Dados de Pacientes
                                        <br />
                                        Use o botão "Reiniciar" para voltar à vista inicial
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
                                primary="Análise Hierárquica de Qualidade"
                                secondary="Navegação por província → distrito → laboratório → dados de pacientes"
                            />
                        </ListItem>

                        <ListItem>
                            <Assessment sx={{ color: 'primary.main', mr: 2 }} />
                            <ListItemText
                                primary="Gráfico de Barras de Rejeições"
                                secondary="Visualização clara do número de amostras rejeitadas com capacidade de drill-down"
                            />
                        </ListItem>

                        <ListItem>
                            <Info sx={{ color: 'primary.main', mr: 2 }} />
                            <ListItemText
                                primary="Comparação entre Tipos de Teste"
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
                        • Use o filtro de datas para selecionar o período de análise
                        <br />
                        • O subtítulo dinâmico mostra automaticamente o intervalo selecionado em português
                    </Typography>

                    <Typography variant="h6" gutterBottom color="secondary.main">
                        2. Alternância entre Tipos de Teste
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ ml: 2 }}>
                        • <strong>Tab Ultra:</strong> Amostras rejeitadas do teste Xpert MTB Ultra 6 Cores
                        <br />
                        • <strong>Tab XDR:</strong> Amostras rejeitadas do teste Xpert MTB XDR 10 Cores
                        <br />
                        • Compare as taxas de rejeição entre os dois tipos de teste
                    </Typography>

                    <Typography variant="h6" gutterBottom color="secondary.main">
                        3. Navegação Hierárquica
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ ml: 2 }}>
                        • Clique numa barra do gráfico para fazer drill-down nos dados
                        <br />
                        • Sequência: Província → Distrito → Laboratório → Dados de Pacientes
                        <br />
                        • Use o botão "Reiniciar" para voltar à vista inicial
                    </Typography>

                    <Typography variant="h6" gutterBottom color="secondary.main">
                        4. Interpretação dos Dados
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ ml: 2 }}>
                        • Identifique laboratórios com maior número de rejeições
                        <br />
                        • Compare o desempenho entre diferentes laboratórios
                        <br />
                        • Analise padrões geográficos de qualidade laboratorial
                    </Typography>

                    <Typography variant="h6" gutterBottom color="secondary.main">
                        5. Exportação de Dados
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ ml: 2 }}>
                        • <strong>Excel:</strong> Exporta dados de rejeições numa folha de cálculo formatada
                        <br />
                        • <strong>Imagem:</strong> Exporta o gráfico actual como ficheiro PNG
                    </Typography>
                </Box>
            </Paper>

            {/* Quality Improvement Applications */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom color="primary.main" fontWeight="bold">
                    Aplicações para Melhoria da Qualidade
                </Typography>

                <Box sx={{ mt: 2 }}>
                    <Typography variant="body1" paragraph>
                        Este relatório é fundamental para:
                    </Typography>
                    <List>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Identificação de Problemas"
                                secondary="Detecção de laboratórios com taxas de rejeição elevadas que necessitam de intervenção"
                            />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Planeamento de Formação"
                                secondary="Orientação de programas de capacitação específicos para laboratórios com maiores dificuldades"
                            />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Monitorização de Melhorias"
                                secondary="Acompanhamento da eficácia de medidas implementadas para reduzir taxas de rejeição"
                            />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Benchmarking"
                                secondary="Comparação de desempenho entre laboratórios para estabelecer melhores práticas"
                            />
                        </ListItem>
                    </List>
                </Box>
            </Paper>

            {/* Common Rejection Causes */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom color="primary.main" fontWeight="bold">
                    Principais Causas de Rejeição
                </Typography>

                <Box sx={{ mt: 2 }}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                            <strong>Nota:</strong> Para análise detalhada das causas específicas de rejeição,
                            consulte o relatório "Amostras Rejeitadas por Laboratório e Motivo".
                        </Typography>
                    </Alert>

                    <List>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Problemas Pré-Analíticos"
                                secondary="Amostra inadequada, não rotulada, insuficiente ou contaminada"
                            />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Falhas Técnicas"
                                secondary="Erros de equipamento, falta de reagentes ou problemas de calibração"
                            />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Problemas de Transporte"
                                secondary="Amostra não recebida, danificada durante o transporte ou fora do prazo"
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
                        <strong>Fonte de Dados:</strong> API endpoint `/tb/gx/laboratories/rejected_samples/`
                    </Typography>
                </Alert>

                <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                        <strong>Estrutura de Dados:</strong> Dados organizados por níveis geográficos com agregação por laboratório
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
                    Sistema OpenLDR - Relatório de Amostras Rejeitadas por Laboratório
                    <br />
                    Para suporte técnico, contacte a equipa de desenvolvimento
                </Typography>
            </Paper>
        </Box>
    );
};

export default MTBRejectedSamplesByLabDocs;