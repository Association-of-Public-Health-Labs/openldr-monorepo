/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { Typography, Box, Paper, Divider, List, ListItem, ListItemText, Alert } from '@mui/material';
import { Science, Timeline, Assessment, Info } from '@mui/icons-material';

const MTBRegisteredByLabDocs: React.FC = () => {
    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            {/* Header */}
            <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'primary.50' }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Science color="primary" fontSize="large" />
                    <Typography variant="h4" component="h1" color="primary.main" fontWeight="bold">
                        Relatório de Amostras Registadas por Laboratório
                    </Typography>
                </Box>
                <Typography variant="h6" color="text.secondary">
                    Documentação Completa do Sistema de Análise de Amostras Registadas por Laboratório
                </Typography>
            </Paper>

            {/* Overview */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom color="primary.main" fontWeight="bold">
                    📋 Visão Geral
                </Typography>
                <Typography variant="body1" paragraph>
                    O Relatório de Amostras Registadas por Laboratório é uma ferramenta fundamental para
                    monitorizar o volume de amostras de tuberculose registadas no sistema laboratorial.
                    Este relatório permite acompanhar a capacidade de processamento e cobertura dos
                    laboratórios em diferentes níveis geográficos.
                </Typography>
                <Typography variant="body1" paragraph>
                    O sistema apresenta dados hierárquicos desde o nível nacional até aos laboratórios
                    individuais, permitindo identificar padrões de registo e oportunidades de melhoria
                    na capacidade laboratorial de diagnóstico de TB.
                </Typography>
            </Paper>

            {/* Test Types */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom color="primary.main" fontWeight="bold">
                    🔬 Tipos de Teste Disponíveis
                </Typography>

                <Box sx={{ mt: 2 }}>
                    <Alert severity="info" sx={{ mb: 3 }}>
                        <Typography variant="body2">
                            O sistema suporta dois tipos principais de testes Xpert MTB, cada um com
                            capacidades específicas de detecção de resistência antimicrobiana.
                        </Typography>
                    </Alert>

                    <List>
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
                                            Xpert MTB Ultra (6 Cores)
                                        </Typography>
                                    </Box>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        Teste de alta sensibilidade para detecção de Mycobacterium tuberculosis
                                        e resistência à rifampicina. Ideal para casos com baixa carga bacilar.
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
                                            Xpert MTB XDR (10 Cores)
                                        </Typography>
                                    </Box>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        Teste avançado para detecção de resistência extensiva (XDR-TB), incluindo
                                        resistência a fluoroquinolonas e aminoglicosídeos de segunda linha.
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
                    📊 Visualização de Dados
                </Typography>

                <Box sx={{ mt: 2 }}>
                    <Alert severity="info" sx={{ mb: 3 }}>
                        <Typography variant="body2">
                            O gráfico de barras apresenta o número total de amostras registadas por laboratório,
                            facilitando a comparação de capacidade de processamento entre diferentes unidades.
                        </Typography>
                    </Alert>

                    <List>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary={
                                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                                        Gráfico de Barras Hierárquico
                                    </Typography>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        Cada barra representa um laboratório com o número total de amostras
                                        registadas. A altura da barra é proporcional ao volume de registos.
                                    </Typography>
                                }
                            />
                        </ListItem>

                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary={
                                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                                        Navegação Drill-Down
                                    </Typography>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        Clique numa barra do gráfico para fazer drill-down nos dados
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
                    🚀 Funcionalidades Principais
                </Typography>

                <Box sx={{ mt: 2 }}>
                    <List>
                        <ListItem>
                            <Timeline sx={{ color: 'primary.main', mr: 2 }} />
                            <ListItemText
                                primary="Análise Hierárquica Laboratorial"
                                secondary="Navegação por província → distrito → laboratório → dados de pacientes"
                            />
                        </ListItem>

                        <ListItem>
                            <Assessment sx={{ color: 'primary.main', mr: 2 }} />
                            <ListItemText
                                primary="Gráfico de Barras Interativo"
                                secondary="Visualização clara do volume de amostras registadas com capacidade de drill-down"
                            />
                        </ListItem>

                        <ListItem>
                            <Info sx={{ color: 'primary.main', mr: 2 }} />
                            <ListItemText
                                primary="Alternância de Tipos de Teste"
                                secondary="Comparação entre dados Ultra e XDR com atualização automática"
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
                        2. Alternância entre Tipos de Teste
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ ml: 2 }}>
                        • <strong>Tab Ultra:</strong> Dados do teste Xpert MTB Ultra 6 Cores
                        <br />
                        • <strong>Tab XDR:</strong> Dados do teste Xpert MTB XDR 10 Cores
                        <br />
                        • Os dados são automaticamente actualizados para o tipo selecionado
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
                        4. Exportação de Dados
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ ml: 2 }}>
                        • <strong>Excel:</strong> Exporta todos os dados numa folha de cálculo formatada
                        <br />
                        • <strong>Imagem:</strong> Exporta o gráfico actual como ficheiro PNG de alta qualidade
                    </Typography>
                </Box>
            </Paper>

            {/* Key Indicators */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom color="primary.main" fontWeight="bold">
                    📈 Principais Indicadores
                </Typography>

                <Box sx={{ mt: 2 }}>
                    <Typography variant="body1" paragraph>
                        Este relatório permite identificar:
                    </Typography>
                    <List>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Capacidade Laboratorial"
                                secondary="Laboratórios com maior volume de amostras registadas e capacidade de processamento"
                            />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Distribuição Geográfica"
                                secondary="Cobertura laboratorial por província e distrito, identificando lacunas na rede"
                            />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Utilização de Tecnologias"
                                secondary="Tendências de utilização dos testes Ultra vs XDR por laboratório"
                            />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Qualidade dos Dados"
                                secondary="Identificação de possíveis inconsistências nos dados de registo laboratorial"
                            />
                        </ListItem>
                    </List>
                </Box>
            </Paper>

            {/* Data Quality Notes */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom color="primary.main" fontWeight="bold">
                    ⚠️ Notas sobre Qualidade dos Dados
                </Typography>

                <Box sx={{ mt: 2 }}>
                    <Alert severity="warning" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                            <strong>Dados "Not Specified":</strong> Indicam amostras registadas sem atribuição clara
                            a uma localização específica. Estes dados são importantes para monitorização da qualidade
                            do sistema de registo.
                        </Typography>
                    </Alert>

                    <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                            <strong>Período de Dados:</strong> O relatório apresenta dados do período selecionado.
                            O subtítulo dinâmico mostra o intervalo de datas em formato português.
                        </Typography>
                    </Alert>

                    <Alert severity="success">
                        <Typography variant="body2">
                            <strong>Actualização em Tempo Real:</strong> Os dados são actualizados automaticamente
                            a partir do sistema OpenLDR com mecanismo de retry para garantir confiabilidade.
                        </Typography>
                    </Alert>
                </Box>
            </Paper>

            {/* Technical Notes */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom color="primary.main" fontWeight="bold">
                    ⚙️ Notas Técnicas
                </Typography>

                <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                        <strong>Fonte de Dados:</strong> API endpoint `/tb/gx/laboratories/registered_samples/`
                    </Typography>
                </Alert>

                <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                        <strong>Estrutura de Dados:</strong> Dados organizados por níveis geográficos com suporte para disagregação laboratorial
                    </Typography>
                </Alert>

                <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                        <strong>Timeout:</strong> As consultas têm um limite de 60 segundos com mecanismo de retry automático
                    </Typography>
                </Alert>

                <Alert severity="success">
                    <Typography variant="body2">
                        <strong>Exportações:</strong> Incluem metadados do relatório para rastreabilidade e auditoria
                    </Typography>
                </Alert>
            </Paper>

            {/* Footer */}
            <Paper elevation={1} sx={{ p: 2, bgcolor: 'grey.50', textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                    Sistema OpenLDR - Relatório de Amostras Registadas por Laboratório
                    <br />
                    Para suporte técnico, contacte a equipa de desenvolvimento
                </Typography>
            </Paper>
        </Box>
    );
};

export default MTBRegisteredByLabDocs;
