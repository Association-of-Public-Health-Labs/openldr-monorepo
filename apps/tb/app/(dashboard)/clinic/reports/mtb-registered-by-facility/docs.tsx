import React from "react";
import { Typography, Box, Paper, Divider, List, ListItem, ListItemText, Alert } from "@mui/material";
import { Business, Timeline, Assessment, Info } from "@mui/icons-material";

const MTBRegisteredByFacilityDocs: React.FC = () => {
    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
            {/* Header */}
            <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: "primary.50" }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Business color="primary" fontSize="large" />
                    <Typography variant="h5" component="h1" color="#009689" fontWeight="bold">
                        Relatório de Amostras Registadas por Unidade Sanitária
                    </Typography>
                </Box>
                <Typography variant="h6" color="text.secondary">
                    Documentação Completa do Sistema de Análise de Amostras Registadas por Unidade Sanitária
                </Typography>
            </Paper>

            {/* Overview */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom color="#009689" fontWeight="bold">
                    Visão Geral
                </Typography>
                <Typography variant="body1" paragraph>
                    O Relatório de Amostras Registadas por Unidade Sanitária é uma ferramenta fundamental para
                    monitorizar o volume de amostras de tuberculose registadas no sistema de saúde. Este relatório
                    permite acompanhar a cobertura e capacidade de registo do sistema em diferentes níveis
                    administrativos.
                </Typography>
                <Typography variant="body1" paragraph>
                    O sistema apresenta dados hierárquicos desde o nível nacional até às unidades sanitárias
                    individuais, permitindo identificar padrões de registo e oportunidades de melhoria na
                    cobertura do diagnóstico de TB.
                </Typography>
            </Paper>

            {/* Chart Visualization */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom color="#009689" fontWeight="bold">
                    Visualização de Dados
                </Typography>

                <Box sx={{ mt: 2 }}>
                    <Alert severity="info" sx={{ mb: 3 }}>
                        <Typography variant="body2">
                            O gráfico de barras apresenta o número total de amostras registadas por unidade sanitária,
                            facilitando a comparação entre diferentes unidades e regiões.
                        </Typography>
                    </Alert>

                    <List>
                        <ListItem sx={{ bgcolor: "grey.50", mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary={
                                    <Typography variant="h6" color="#009689" fontWeight="bold">
                                        Gráfico de Barras Simples
                                    </Typography>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        Cada barra representa uma unidade sanitária com o número total de amostras
                                        registadas no período selecionado. A altura da barra é proporcional ao volume
                                        de registos.
                                    </Typography>
                                }
                            />
                        </ListItem>

                        <ListItem sx={{ bgcolor: "grey.50", mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary={
                                    <Typography variant="h6" color="#009689" fontWeight="bold">
                                        Navegação Hierárquica
                                    </Typography>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        Clique numa barra do gráfico para fazer drill-down nos dados
                                        <br />
                                        Sequência: Província → Distrito → Unidade Sanitária → Diálogo de Pacientes
                                        <br />
                                        Use o botão &QUOT;Reiniciar&QUOT; para voltar à vista inicial
                                    </Typography>
                                }
                            />
                        </ListItem>

                        <ListItem sx={{ bgcolor: "grey.50", mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary={
                                    <Typography variant="h6" color="#009689" fontWeight="bold">
                                        Alternância de Tabs
                                    </Typography>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        Use as tabs &QUOT;Ultra&QUOT; e &QUOT;XDR&QUOT; para alternar entre tipos de teste
                                        <br />
                                        Os dados são automaticamente actualizados para o tipo selecionado
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
                    Funcionalidades Principais
                </Typography>

                <Box sx={{ mt: 2 }}>
                    <List>
                        <ListItem>
                            <Timeline sx={{ color: "primary.main", mr: 2 }} />
                            <ListItemText
                                primary="Análise Hierárquica"
                                secondary="Navegação por província → distrito → unidade sanitária → dados de pacientes"
                            />
                        </ListItem>

                        <ListItem>
                            <Assessment sx={{ color: "primary.main", mr: 2 }} />
                            <ListItemText
                                primary="Gráfico de Barras Interativo"
                                secondary="Visualização clara do volume de amostras registadas com capacidade de drill-down"
                            />
                        </ListItem>

                        <ListItem>
                            <Info sx={{ color: "primary.main", mr: 2 }} />
                            <ListItemText
                                primary="Filtros Dinâmicos"
                                secondary="Seleção de período temporal e tipo de unidade sanitária"
                            />
                        </ListItem>
                    </List>
                </Box>
            </Paper>

            {/* Usage Instructions */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom color="#009689" fontWeight="bold">
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
                        2. Navegação Hierárquica
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ ml: 2 }}>
                        • Clique numa barra do gráfico para fazer drill-down nos dados
                        <br />
                        • Sequência: Província → Distrito → Unidade Sanitária → Diálogo de Pacientes
                        <br />
                        • Use o botão &QUOT;Reiniciar&QUOT; para voltar à vista inicial
                    </Typography>

                    <Typography variant="h6" gutterBottom color="secondary.main">
                        3. Alternância entre Tabs
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ ml: 2 }}>
                        • Use as tabs &QUOT;Ultra&QUOT; e &QUOT;XDR&QUOT; para alternar entre tipos de teste
                        <br />
                        • Os dados são automaticamente actualizados para o tipo selecionado
                    </Typography>

                    <Typography variant="h6" gutterBottom color="secondary.main">
                        4. Exportação de Dados
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ ml: 2 }}>
                        • <strong>Excel:</strong> Exporta todos os dados numa folha de cálculo formatada
                        <br />
                        • <strong>Imagem:</strong> Exporta o gráfico actual como ficheiro PNG
                    </Typography>
                </Box>
            </Paper>

            {/* Operational Utility */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom color="#009689" fontWeight="bold">
                    Utilidade Operacional
                </Typography>

                <Box sx={{ mt: 2 }}>
                    <Typography variant="body1" paragraph>
                        Este relatório é fundamental para:
                    </Typography>
                    <List>
                        <ListItem sx={{ bgcolor: "grey.50", mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Monitorização da Cobertura"
                                secondary="Identificar unidades sanitárias com baixo volume de registo e avaliar a cobertura do sistema de diagnóstico"
                            />
                        </ListItem>
                        <ListItem sx={{ bgcolor: "grey.50", mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Planeamento de Recursos"
                                secondary="Orientar a distribuição de equipamentos, reagentes e recursos humanos baseado no volume de testagens"
                            />
                        </ListItem>
                        <ListItem sx={{ bgcolor: "grey.50", mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Análise de Disparidades"
                                secondary="Identificar disparidades regionais na capacidade de diagnóstico e orientar intervenções específicas"
                            />
                        </ListItem>
                    </List>
                </Box>
            </Paper>

            {/* Technical Notes */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom color="#009689" fontWeight="bold">
                    Notas Técnicas
                </Typography>

                <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                        <strong>Fonte de Dados:</strong> API endpoint `/tb/gx/facilities/registered_samples/`
                    </Typography>
                </Alert>

                <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                        <strong>Estrutura de Dados:</strong> Dados organizados por níveis administrativos com suporte para disagregação geográfica
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
            <Paper elevation={1} sx={{ p: 2, bgcolor: "grey.50", textAlign: "center" }}>
                <Typography variant="body2" color="text.secondary">
                    Sistema OpenLDR - Relatório de Amostras Registadas por Unidade Sanitária
                    <br />
                    Para suporte técnico, contacte a equipa de desenvolvimento
                </Typography>
            </Paper>
        </Box>
    );
};

export default MTBRegisteredByFacilityDocs;