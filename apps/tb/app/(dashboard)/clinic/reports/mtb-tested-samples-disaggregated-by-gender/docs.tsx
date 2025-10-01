import React from 'react';
import { Typography, Box, Paper, Divider, List, ListItem, ListItemText, Alert } from '@mui/material';
import { People, Timeline, Assessment, Info } from '@mui/icons-material';

const MTBTestedSamplesDisaggregatedByGenderDocs: React.FC = () => {
    return (
        <Box sx={{
            p: 3,
            maxWidth: 800,
            mx: 'auto',
        }}>
            {/* Header */}
            <Paper elevation={2} sx={{
                p: 3,
                mb: 3,
                bgcolor: 'primary.50',
            }}>
                <Box display="flex" alignItems="center" gap={2} mb={2} sx={{ flexWrap: 'wrap' }}>
                    <People color="primary" fontSize="large" />
                    <Typography
                        variant="h5"
                        component="h1"
                        color="#009689"
                        fontWeight="bold"
                        sx={{
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word',
                            hyphens: 'auto'
                        }}
                    >
                        Relatório de Amostras Testadas por Género
                    </Typography>
                </Box>
                <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word'
                    }}
                >
                    Documentação Completa do Sistema de Análise de Amostras por Género
                </Typography>
            </Paper>

            {/* Overview */}
            <Paper elevation={1} sx={{
                p: 3,
                mb: 3,
                width: '100%',
                boxSizing: 'border-box'
            }}>
                <Typography
                    variant="h6"
                    gutterBottom
                    color="#009689"
                    fontWeight="bold"
                    sx={{
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word'
                    }}
                >
                    Visão Geral
                </Typography>
                <Typography
                    variant="body1"
                    paragraph
                    sx={{
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word'
                    }}
                >
                    O Relatório de Amostras Testadas por Género é uma ferramenta epidemiológica essencial 
                    que analisa a distribuição de casos de tuberculose por género. Este relatório permite 
                    identificar padrões específicos de género na incidência de TB e orientar estratégias 
                    de saúde pública direcionadas.
                </Typography>
                <Typography
                    variant="body1"
                    paragraph
                    sx={{
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word'
                    }}
                >
                    O sistema apresenta dados em formato de gráfico empilhado agrupado que mostra a distribuição 
                    de resultados de testes por género, facilitando a análise comparativa entre homens 
                    e mulheres em diferentes contextos epidemiológicos.
                </Typography>
            </Paper>

            {/* Gender Analysis */}
            <Paper elevation={1} sx={{
                p: 3,
                mb: 3,
                width: '100%',
                boxSizing: 'border-box'
            }}>
                <Typography
                    variant="h6"
                    gutterBottom
                    color="#009689"
                    fontWeight="bold"
                    sx={{
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word'
                    }}
                >
                    Análise por Género
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                    <Alert severity="info" sx={{ mb: 3 }}>
                        <Typography
                            variant="body2"
                            sx={{
                                wordWrap: 'break-word',
                                overflowWrap: 'break-word'
                            }}
                        >
                            A análise por género permite identificar disparidades na incidência de tuberculose 
                            e orientar estratégias de prevenção e tratamento específicas para cada população.
                        </Typography>
                    </Alert>

                    <List>
                        <ListItem sx={{
                            bgcolor: '#e0f2f1',
                            mb: 1,
                            borderRadius: 1,
                            border: '1px solid #00695c',
                            width: '100%',
                            boxSizing: 'border-box'
                        }}>
                            <ListItemText
                                primary={
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Box
                                            sx={{
                                                width: 16,
                                                height: 16,
                                                backgroundColor: '#00695c',
                                                borderRadius: 0.5
                                            }}
                                        />
                                        <Typography
                                            sx={{ fontWeight: 'bold' }}
                                        >
                                            Masculino
                                        </Typography>
                                    </Box>
                                }
                                secondary={
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            wordWrap: 'break-word',
                                            overflowWrap: 'break-word'
                                        }}
                                    >
                                        Casos de tuberculose em pacientes do género masculino (cores verde-azuladas)
                                        <br />
                                        • Resistente: #00695c (verde-azulado escuro)
                                        <br />
                                        • Sensível: #4db6ac (verde-azulado claro)
                                    </Typography>
                                }
                            />
                        </ListItem>

                        <ListItem sx={{
                            bgcolor: '#fbe9e7',
                            mb: 1,
                            borderRadius: 1,
                            border: '1px solid #d63900',
                            width: '100%',
                            boxSizing: 'border-box'
                        }}>
                            <ListItemText
                                primary={
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Box
                                            sx={{
                                                width: 16,
                                                height: 16,
                                                backgroundColor: '#d63900',
                                                borderRadius: 0.5
                                            }}
                                        />
                                        <Typography
                                            sx={{ fontWeight: 'bold' }}
                                        >
                                            Feminino
                                        </Typography>
                                    </Box>
                                }
                                secondary={
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            wordWrap: 'break-word',
                                            overflowWrap: 'break-word'
                                        }}
                                    >
                                        Casos de tuberculose em pacientes do género feminino (cores laranja-vermelhas)
                                        <br />
                                        • Resistente: #d63900 (laranja-vermelho escuro)
                                        <br />
                                        • Sensível: #ff7a47 (laranja-vermelho claro)
                                    </Typography>
                                }
                            />
                        </ListItem>
                    </List>
                </Box>
            </Paper>

            {/* Test Results Categories */}
            <Paper elevation={1} sx={{
                p: 3,
                mb: 3,
                width: '100%',
                boxSizing: 'border-box'
            }}>
                <Typography
                    variant="h6"
                    gutterBottom
                    color="#009689"
                    fontWeight="bold"
                    sx={{
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word'
                    }}
                >
                    Categorias de Resultados
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                    <List>
                        <ListItem sx={{
                            bgcolor: '#ffebee',
                            mb: 1,
                            borderRadius: 1,
                            border: '1px solid #f44336',
                            width: '100%',
                            boxSizing: 'border-box'
                        }}>
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
                                        <Typography
                                            sx={{ fontWeight: 'bold' }}
                                        >
                                            MTB Detetado
                                        </Typography>
                                    </Box>
                                }
                                secondary={
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            wordWrap: 'break-word',
                                            overflowWrap: 'break-word'
                                        }}
                                    >
                                        Casos positivos para Mycobacterium tuberculosis, analisados por género 
                                        para identificar padrões epidemiológicos específicos.
                                    </Typography>
                                }
                            />
                        </ListItem>

                        <ListItem sx={{
                            bgcolor: '#e8f5e8',
                            mb: 1,
                            borderRadius: 1,
                            border: '1px solid #4caf50',
                            width: '100%',
                            boxSizing: 'border-box'
                        }}>
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
                                        <Typography
                                            variant="h6"
                                            sx={{ fontWeight: 'bold' }}
                                        >
                                            MTB Não Detetado
                                        </Typography>
                                    </Box>
                                }
                                secondary={
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            wordWrap: 'break-word',
                                            overflowWrap: 'break-word'
                                        }}
                                    >
                                        Casos negativos para tuberculose, importantes para análise da 
                                        distribuição de testagens por género.
                                    </Typography>
                                }
                            />
                        </ListItem>

                        <ListItem sx={{
                            bgcolor: '#fff3e0',
                            mb: 1,
                            borderRadius: 1,
                            border: '1px solid #ff9800',
                            width: '100%',
                            boxSizing: 'border-box'
                        }}>
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
                                        <Typography
                                            variant="h6"
                                            sx={{ fontWeight: 'bold' }}
                                        >
                                            Erros e Inválidos
                                        </Typography>
                                    </Box>
                                }
                                secondary={
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            wordWrap: 'break-word',
                                            overflowWrap: 'break-word'
                                        }}
                                    >
                                        Casos com resultados inconclusivos ou erros técnicos, analisados por 
                                        género para identificar padrões de qualidade laboratorial.
                                    </Typography>
                                }
                            />
                        </ListItem>
                    </List>
                </Box>
            </Paper>

            {/* Features */}
            <Paper elevation={1} sx={{
                p: 3,
                mb: 3,
                width: '100%',
                boxSizing: 'border-box'
            }}>
                <Typography
                    variant="h5"
                    gutterBottom
                    color="primary.main"
                    fontWeight="bold"
                >
                    Funcionalidades Principais
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                    <List>
                        <ListItem>
                            <Timeline sx={{ color: 'primary.main', mr: 2 }} />
                            <ListItemText
                                primary="Análise Comparativa por Género"
                                secondary="Comparação direta entre padrões masculinos e femininos de tuberculose"
                            />
                        </ListItem>
                        
                        <ListItem>
                            <Assessment sx={{ color: 'primary.main', mr: 2 }} />
                            <ListItemText
                                primary="Gráfico Empilhado por Género"
                                secondary="Visualização clara da distribuição de resultados por género"
                            />
                        </ListItem>
                        
                        <ListItem>
                            <Info sx={{ color: 'primary.main', mr: 2 }} />
                            <ListItemText
                                primary="Análise Epidemiológica"
                                secondary="Identificação de disparidades de género na incidência de TB"
                            />
                        </ListItem>
                    </List>
                </Box>
            </Paper>

            {/* Usage Instructions */}
            <Paper elevation={1} sx={{
                p: 3,
                mb: 3,
                width: '100%',
                boxSizing: 'border-box'
            }}>
                <Typography
                    variant="h5"
                    gutterBottom
                    color="primary.main"
                    fontWeight="bold"
                >
                    Como Utilizar
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                    <Typography
                        variant="h6"
                        gutterBottom
                        color="secondary.main"
                    >
                        1. Seleção do Período
                    </Typography>
                    <Typography
                        variant="body2"
                        paragraph
                        sx={{ ml: 2 }}
                    >
                        • Use o filtro de datas para selecionar o período de análise
                        <br />
                        • O subtítulo dinâmico mostra automaticamente o intervalo selecionado em português
                    </Typography>

                    <Typography
                        variant="h6"
                        gutterBottom
                        color="secondary.main"
                    >
                        2. Interpretação do Gráfico
                    </Typography>
                    <Typography
                        variant="body2"
                        paragraph
                        sx={{ ml: 2 }}
                    >
                        • Eixo X: Categorias por género (Masculino, Feminino)
                        <br />
                        • Eixo Y: Número de casos por categoria
                        <br />
                        • Cores: MTB Detetado (vermelho), MTB Não Detetado (verde), Erros/Inválidos (laranja)
                        <br />
                        • Cada barra mostra a distribuição empilhada por género
                    </Typography>

                    <Typography
                        variant="h6"
                        gutterBottom
                        color="secondary.main"
                    >
                        3. Análise Comparativa
                    </Typography>
                    <Typography
                        variant="body2"
                        paragraph
                        sx={{ ml: 2 }}
                    >
                        • Compare as proporções entre géneros para cada categoria de resultado
                        <br />
                        • Identifique disparidades na incidência de casos positivos
                        <br />
                        • Analise padrões de testagem por género
                    </Typography>

                    <Typography
                        variant="h6"
                        gutterBottom
                        color="secondary.main"
                    >
                        4. Alternância entre Tabs
                    </Typography>
                    <Typography
                        variant="body2"
                        paragraph
                        sx={{ ml: 2 }}
                    >
                        • Use as tabs "Ultra" e "XDR" para alternar entre tipos de teste
                        <br />
                        • Os dados são automaticamente actualizados para o tipo selecionado
                    </Typography>

                    <Typography
                        variant="h6"
                        gutterBottom
                        color="secondary.main"
                    >
                        5. Exportação de Dados
                    </Typography>
                    <Typography
                        variant="body2"
                        paragraph
                        sx={{ ml: 2 }}
                    >
                        • <strong>Excel:</strong> Exporta dados com distribuição por género e categoria
                        <br />
                        • <strong>Imagem:</strong> Exporta o gráfico empilhado como ficheiro PNG
                    </Typography>
                </Box>
            </Paper>

            {/* Public Health Applications */}
            <Paper elevation={1} sx={{
                p: 3,
                mb: 3,
                width: '100%',
                boxSizing: 'border-box'
            }}>
                <Typography
                    variant="h5"
                    gutterBottom
                    color="primary.main"
                    fontWeight="bold"
                >
                    Aplicações em Saúde Pública
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                    <Typography
                        variant="body1"
                        paragraph
                    >
                        Este relatório é fundamental para:
                    </Typography>
                    <List>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Estratégias Específicas por Género"
                                secondary="Desenvolvimento de programas de prevenção e tratamento direcionados para homens e mulheres"
                            />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Identificação de Disparidades"
                                secondary="Detecção de desigualdades de género no acesso ao diagnóstico e tratamento de TB"
                            />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Planeamento de Campanhas"
                                secondary="Orientação de campanhas de sensibilização específicas para cada género"
                            />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Análise de Vulnerabilidades"
                                secondary="Identificação de grupos de género com maior risco ou vulnerabilidade à TB"
                            />
                        </ListItem>
                    </List>
                </Box>
            </Paper>

            {/* Epidemiological Insights */}
            <Paper elevation={1} sx={{
                p: 3,
                mb: 3,
                width: '100%',
                boxSizing: 'border-box'
            }}>
                <Typography
                    variant="h5"
                    gutterBottom
                    color="primary.main"
                    fontWeight="bold"
                >
                    Insights Epidemiológicos
                </Typography>
                
                <Box sx={{ mt: 2 }}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography
                            variant="body2"
                        >
                            <strong>Padrões Globais:</strong> Historicamente, a tuberculose afeta mais homens que mulheres, 
                            mas as razões variam entre regiões e contextos socioeconómicos.
                        </Typography>
                    </Alert>

                    <List>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Fatores Biológicos"
                                secondary="Diferenças hormonais e imunológicas podem influenciar a susceptibilidade à TB"
                            />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Fatores Sociais"
                                secondary="Exposição ocupacional, comportamentos de risco e acesso aos cuidados de saúde"
                            />
                        </ListItem>
                        <ListItem sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                            <ListItemText
                                primary="Considerações Especiais"
                                secondary="TB em mulheres grávidas, co-infecção HIV-TB, e resistência antimicrobiana por género"
                            />
                        </ListItem>
                    </List>
                </Box>
            </Paper>

            {/* Technical Notes */}
            <Paper elevation={1} sx={{
                p: 3,
                mb: 3,
                width: '100%',
                boxSizing: 'border-box'
            }}>
                <Typography
                    variant="h5"
                    gutterBottom
                    color="primary.main"
                    fontWeight="bold"
                >
                    Notas Técnicas
                </Typography>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography
                        variant="body2"
                    >
                        <strong>Fonte de Dados:</strong> API endpoint `/tb/gx/facilities/tested_samples_disaggregated_by_gender/`
                    </Typography>
                </Alert>

                <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography
                        variant="body2"
                    >
                        <strong>Estrutura de Dados:</strong> Dados organizados por género com categorias de resultados de testes
                    </Typography>
                </Alert>

                <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography
                        variant="body2"
                    >
                        <strong>Timeout:</strong> As consultas têm um limite de 60 segundos com mecanismo de retry automático
                    </Typography>
                </Alert>

                <Alert severity="success">
                    <Typography
                        variant="body2"
                    >
                        <strong>Actualização:</strong> Os dados são actualizados automaticamente quando se altera qualquer filtro ou tab
                    </Typography>
                </Alert>
            </Paper>

            {/* Footer */}
            <Paper elevation={1} sx={{
                p: 2,
                bgcolor: 'grey.50',
                textAlign: 'center'
            }}>
                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    Sistema OpenLDR - Relatório de Amostras Testadas por Género
                    <br />
                    Para suporte técnico, contacte a equipa de desenvolvimento
                </Typography>
            </Paper>
        </Box>
    );
};

export default MTBTestedSamplesDisaggregatedByGenderDocs;