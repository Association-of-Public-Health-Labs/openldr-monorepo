/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { Typography, Box, Paper, Divider, List, ListItem, ListItemText, Alert } from '@mui/material';
import { Medication, Timeline, Assessment, Info } from '@mui/icons-material';

function MTBTestedSamplesDisaggregatedByDrugDocs () {
    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            {/* Header */}
            <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'primary.50' }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Medication color="primary" fontSize="large" />
                    <Typography variant="h5" component="h1" color="#009689" fontWeight="bold">
                        Relatório de Amostras Testadas Disagregadas por Medicamento
                    </Typography>
                </Box>
                <Typography variant="h6" color="text.secondary">
                    Documentação Completa do Sistema de Análise de Resistência a Medicamentos Antituberculose
                </Typography>
            </Paper>

            {/* Overview */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom color="#009689" fontWeight="bold">
                    Visão Geral
                </Typography>
                <Typography variant="body1" paragraph>
                    O Relatório de Amostras Testadas Disagregadas por Medicamento é uma ferramenta avançada para
                    análise detalhada de padrões de resistência a medicamentos antituberculose específicos.
                    Este relatório permite identificar perfis de resistência múltipla e orientar estratégias
                    terapêuticas personalizadas.
                </Typography>
                <Typography variant="body1" paragraph>
                    O sistema apresenta dados em formato de gráfico empilhado que mostra a distribuição de
                    resistência, sensibilidade e resultados indeterminados para cada medicamento testado,
                    facilitando a identificação de padrões de resistência cruzada.
                </Typography>
            </Paper>

            {/* Drug Categories */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom color="#009689" fontWeight="bold">
                    Medicamentos Analisados
                </Typography>

                <Box sx={{ mt: 2 }}>
                    <Alert severity="info" sx={{ mb: 3 }}>
                        <Typography variant="body2">
                            O teste Xpert MTB/XDR analisa a resistência a múltiplos medicamentos antituberculose,
                            fornecendo um perfil completo de sensibilidade antimicrobiana.
                        </Typography>
                    </Alert>

                    <List>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary={
                                    <Typography variant="h6" color="#009689" fontWeight="bold">
                                        Medicamentos de Primeira Linha
                                    </Typography>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        • Rifampicina (RIF): Medicamento chave no tratamento da TB
                                        <br />
                                        • Isoniazida (INH): Medicamento bactericida essencial
                                        <br />
                                        • Etambutol (EMB): Medicamento bacteriostático
                                    </Typography>
                                }
                            />
                        </ListItem>

                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary={
                                    <Typography variant="h6" color="#009689" fontWeight="bold">
                                        Medicamentos de Segunda Linha
                                    </Typography>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        • Fluoroquinolonas: Levofloxacina, Moxifloxacina
                                        <br />
                                        • Aminoglicosídeos: Amicacina, Capreomicina
                                        <br />
                                        • Outros: Linezolida, Bedaquilina, Clofazimina
                                    </Typography>
                                }
                            />
                        </ListItem>
                    </List>
                </Box>
            </Paper>

            {/* Resistance Categories */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom color="#009689" fontWeight="bold">
                    Categorias de Resultado
                </Typography>

                <Box sx={{ mt: 2 }}>
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
                                            Resistente
                                        </Typography>
                                    </Box>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        Casos que apresentam resistência ao medicamento específico, requerendo
                                        ajuste do esquema terapêutico com medicamentos alternativos.
                                    </Typography>
                                }
                            />
                        </ListItem>

                        <ListItem sx={{ bgcolor: '#e8f5e8', mb: 1, borderRadius: 1, border: '1px solid #009689' }}>
                            <ListItemText
                                primary={
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Box
                                            sx={{
                                                width: 16,
                                                height: 16,
                                                backgroundColor: '#009689',
                                                borderRadius: 0.5
                                            }}
                                        />
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                            Sensível
                                        </Typography>
                                    </Box>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        Casos sensíveis ao medicamento, indicando que pode ser incluído
                                        no esquema terapêutico com eficácia esperada.
                                    </Typography>
                                }
                            />
                        </ListItem>

                        <ListItem sx={{ bgcolor: '#E6F5FB', mb: 1, borderRadius: 1, border: '1px solid #104E64' }}>
                            <ListItemText
                                primary={
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Box
                                            sx={{
                                                width: 16,
                                                height: 16,
                                                backgroundColor: '#104E64',
                                                borderRadius: 0.5
                                            }}
                                        />
                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                            Indeterminado
                                        </Typography>
                                    </Box>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        Casos onde não foi possível determinar o perfil de sensibilidade,
                                        requerendo testes adicionais ou métodos complementares.
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
                            <Timeline sx={{ color: 'primary.main', mr: 2 }} />
                            <ListItemText
                                primary="Análise Hierárquica"
                                secondary="Navegação por província → distrito → unidade sanitária → dados de pacientes"
                            />
                        </ListItem>

                        <ListItem>
                            <Assessment sx={{ color: 'primary.main', mr: 2 }} />
                            <ListItemText
                                primary="Gráfico Empilhado Interativo"
                                secondary="Visualização detalhada dos padrões de resistência por medicamento específico"
                            />
                        </ListItem>

                        <ListItem>
                            <Info sx={{ color: 'primary.main', mr: 2 }} />
                            <ListItemText
                                primary="Análise Farmacológica"
                                secondary="Identificação de padrões de resistência múltipla para orientação terapêutica"
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
                    <Typography gutterBottom color="secondary.main">
                        1. Seleção do Período
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ ml: 2 }}>
                        • Use o filtro de datas para selecionar o período de análise
                        <br />
                        • O subtítulo dinâmico mostra automaticamente o intervalo selecionado em português
                    </Typography>

                    <Typography gutterBottom color="secondary.main">
                        2. Interpretação do Gráfico
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ ml: 2 }}>
                        • Cada medicamento é representado por uma barra empilhada
                        <br />
                        • Vermelho: Casos resistentes ao medicamento
                        <br />
                        • Verde: Casos sensíveis ao medicamento
                        <br />
                        • Laranja: Casos com resultado indeterminado
                    </Typography>

                    <Typography gutterBottom color="secondary.main">
                        3. Navegação Hierárquica
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ ml: 2 }}>
                        • Clique numa barra para fazer drill-down nos dados
                        <br />
                        • Sequência: Província → Distrito → Unidade Sanitária → Diálogo de Pacientes
                        <br />
                        • Use o botão "Reiniciar" para voltar à vista inicial
                    </Typography>

                    <Typography gutterBottom color="secondary.main">
                        4. Exportação de Dados
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ ml: 2 }}>
                        • <strong>Excel:</strong> Exporta dados com perfis de resistência por medicamento
                        <br />
                        • <strong>Imagem:</strong> Exporta o gráfico empilhado como ficheiro PNG
                    </Typography>
                </Box>
            </Paper>

            {/* Clinical Applications */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom color="#009689" fontWeight="bold">
                    Aplicações Clínicas
                </Typography>

                <Box sx={{ mt: 2 }}>
                    <Typography variant="body1" paragraph>
                        Este relatório é fundamental para:
                    </Typography>
                    <List>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Seleção de Esquemas Terapêuticos"
                                secondary="Escolha de medicamentos baseada no perfil individual de resistência de cada paciente"
                            />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Vigilância de Resistência"
                                secondary="Monitorização de padrões emergentes de resistência múltipla e XDR-TB"
                            />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Gestão de Medicamentos"
                                secondary="Planeamento de stocks e distribuição de medicamentos de segunda linha"
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
                        <strong>Fonte de Dados:</strong> API endpoint `/tb/gx/facilities/tested_samples_disaggregated_by_drug/`
                    </Typography>
                </Alert>

                <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                        <strong>Estrutura de Dados:</strong> Perfis de resistência por medicamento organizados por níveis administrativos
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
                    Sistema OpenLDR - Relatório de Amostras Testadas Disagregadas por Medicamento
                    <br />
                    Para suporte técnico, contacte a equipa de desenvolvimento
                </Typography>
            </Paper>
        </Box>
    );
};

export default MTBTestedSamplesDisaggregatedByDrugDocs;
