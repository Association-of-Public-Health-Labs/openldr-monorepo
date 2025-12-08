/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import { Typography, Box, Paper, Divider, List, ListItem, ListItemText, Alert } from '@mui/material';
import { Biotech, Timeline, Assessment, Info } from '@mui/icons-material';

function MTBTestedRifByFacilityDocs () {
    return (
        <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
            {/* Header */}
            <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'primary.50' }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Biotech color="primary" fontSize="large" />
                    <Typography variant="h4" component="h1" color="primary.main" fontWeight="bold">
                        Relatório de Resistência à Rifampicina por Unidade Sanitária
                    </Typography>
                </Box>
                <Typography variant="h6" color="text.secondary">
                    Documentação Completa do Sistema de Análise de Resistência à Rifampicina por Unidade Sanitária
                </Typography>
            </Paper>

            {/* Overview */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom color="primary.main" fontWeight="bold">
                    Visão Geral
                </Typography>
                <Typography variant="body1" paragraph>
                    O Relatório de Resistência à Rifampicina por Unidade Sanitária é uma ferramenta crítica para 
                    monitorizar padrões de resistência antimicrobiana no diagnóstico de tuberculose. Este relatório 
                    permite identificar áreas com maior incidência de tuberculose resistente e orientar estratégias 
                    de tratamento adequadas.
                </Typography>
                <Typography variant="body1" paragraph>
                    O sistema apresenta dados hierárquicos que mostram a distribuição de casos resistentes, 
                    sensíveis e indeterminados por unidade sanitária, facilitando a identificação de padrões 
                    epidemiológicos e necessidades de intervenção clínica.
                </Typography>
            </Paper>

            {/* Resistance Categories */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom color="primary.main" fontWeight="bold">
                    Categorias de Resistência
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                    <Alert severity="info" sx={{ mb: 3 }}>
                        <Typography variant="body2">
                            O teste Xpert MTB/RIF detecta simultaneamente o Mycobacterium tuberculosis e a resistência 
                            à rifampicina, fornecendo resultados em três categorias principais.
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
                                            Resistente
                                        </Typography>
                                    </Box>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        Casos que apresentam resistência à rifampicina, indicando tuberculose 
                                        multirresistente (MDR-TB) que requer esquema terapêutico especializado.
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
                                            Sensível
                                        </Typography>
                                    </Box>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        Casos sensíveis à rifampicina, indicando tuberculose suscetível ao 
                                        tratamento padrão com esquema básico de primeira linha.
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
                                            Indeterminado
                                        </Typography>
                                    </Box>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        Casos onde não foi possível determinar o perfil de resistência, 
                                        requerendo testes adicionais ou repetição da análise.
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
                    <List>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary={
                                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                                        Gráfico Empilhado
                                    </Typography>
                                }
                                secondary={
                                    <Typography variant="body2" color="text.secondary">
                                        Cada barra representa uma unidade sanitária com segmentos coloridos mostrando 
                                        a distribuição de casos resistentes, sensíveis e indeterminados.
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
                                        Clique numa barra para fazer drill-down: Província → Distrito → Unidade Sanitária → 
                                        Dados de Pacientes com perfis de resistência específicos.
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
                                primary="Análise Hierárquica"
                                secondary="Navegação por província → distrito → unidade sanitária → dados de pacientes"
                            />
                        </ListItem>
                        
                        <ListItem>
                            <Assessment sx={{ color: 'primary.main', mr: 2 }} />
                            <ListItemText
                                primary="Gráfico Empilhado Interativo"
                                secondary="Visualização clara dos padrões de resistência com três categorias específicas"
                            />
                        </ListItem>
                        
                        <ListItem>
                            <Info sx={{ color: 'primary.main', mr: 2 }} />
                            <ListItemText
                                primary="Análise Epidemiológica"
                                secondary="Identificação de padrões de resistência para orientação clínica"
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
                        2. Interpretação do Gráfico
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ ml: 2 }}>
                        • Vermelho: Casos resistentes à rifampicina (MDR-TB)
                        <br />
                        • Verde: Casos sensíveis à rifampicina
                        <br />
                        • Laranja: Casos com resultado indeterminado
                        <br />
                        • A altura total da barra mostra o volume total de casos testados
                    </Typography>

                    <Typography variant="h6" gutterBottom color="secondary.main">
                        3. Navegação Hierárquica
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ ml: 2 }}>
                        • Clique numa barra para fazer drill-down nos dados
                        <br />
                        • Sequência: Província → Distrito → Unidade Sanitária → Diálogo de Pacientes
                        <br />
                        • Use o botão "Reiniciar" para voltar à vista inicial
                    </Typography>

                    <Typography variant="h6" gutterBottom color="secondary.main">
                        4. Exportação de Dados
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ ml: 2 }}>
                        • <strong>Excel:</strong> Exporta dados com todas as categorias de resistência
                        <br />
                        • <strong>Imagem:</strong> Exporta o gráfico empilhado como ficheiro PNG
                    </Typography>
                </Box>
            </Paper>

            {/* Clinical Significance */}
            <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                <Typography variant="h5" gutterBottom color="primary.main" fontWeight="bold">
                    Significado Clínico
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                    <Typography variant="body1" paragraph>
                        Este relatório é fundamental para:
                    </Typography>
                    <List>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Vigilância Epidemiológica"
                                secondary="Monitorização de padrões de resistência antimicrobiana e identificação de surtos de MDR-TB"
                            />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Orientação Terapêutica"
                                secondary="Seleção adequada de esquemas de tratamento baseada no perfil de resistência"
                            />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Controlo de Infecção"
                                secondary="Implementação de medidas de isolamento e controlo para casos resistentes"
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
                        <strong>Fonte de Dados:</strong> API endpoint `/tb/gx/facilities/tested_rif_by_facility/`
                    </Typography>
                </Alert>

                <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                        <strong>Estrutura de Dados:</strong> Três categorias de resistência organizadas por níveis administrativos
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
                    Sistema OpenLDR - Relatório de Resistência à Rifampicina por Unidade Sanitária
                    <br />
                    Para suporte técnico, contacte a equipa de desenvolvimento
                </Typography>
            </Paper>
        </Box>
    );
};

export default MTBTestedRifByFacilityDocs;
