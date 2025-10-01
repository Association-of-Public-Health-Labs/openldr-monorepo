import React from 'react';
import { Typography, Box, Paper, Divider, List, ListItem, ListItemText, Alert } from '@mui/material';
import { Psychology, Timeline, Assessment, Info } from '@mui/icons-material';

const MTBTestedSamplesDisaggregatedByDrugAndAgeDocs: React.FC = () => {
    return (
        <Box sx={{
            p: 3,
            maxWidth: 1200,
            mx: 'auto',
        }}>
            {/* Header */}
            <Paper elevation={2} sx={{
                p: 3,
                mb: 3,
                bgcolor: 'primary.50',
            }}>
                <Box display="flex" alignItems="center" gap={2} mb={2} sx={{ flexWrap: 'wrap' }}>
                    <Psychology color="primary" fontSize="large" />
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
                        Relatório de Amostras Testadas por Medicamento e Idade
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
                    Documentação Completa do Sistema de Análise de Resistência por Medicamento e Faixa Etária
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
                    O Relatório de Amostras Testadas por Medicamento e Idade é uma ferramenta epidemiológica
                    avançada que combina análise de resistência antimicrobiana com distribuição etária.
                    Este relatório permite identificar padrões de resistência específicos por faixa etária
                    e orientar estratégias terapêuticas personalizadas.
                </Typography>
                <Typography
                    variant="body1"
                    paragraph
                    sx={{
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word'
                    }}
                >
                    O sistema apresenta dados em formato de gráfico empilhado bidimensional que mostra
                    simultaneamente a distribuição de resistência por medicamento e por grupo etário,
                    facilitando a identificação de vulnerabilidades específicas por idade.
                </Typography>
            </Paper>

            {/* Age Groups */}
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
                    Grupos Etários Analisados
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
                            A análise por faixa etária permite identificar padrões de resistência específicos
                            em diferentes grupos populacionais, orientando estratégias de tratamento adequadas.
                        </Typography>
                    </Alert>

                    <List>
                        <ListItem sx={{
                            bgcolor: 'grey.50',
                            mb: 1,
                            borderRadius: 1,
                            width: '100%',
                            boxSizing: 'border-box'
                        }}>
                            <ListItemText
                                primary={
                                    <Typography
                                        variant="h6"
                                        color="#009689"
                                        fontWeight="bold"
                                        sx={{
                                            wordWrap: 'break-word',
                                            overflowWrap: 'break-word'
                                        }}
                                    >
                                        Grupos Pediátricos
                                    </Typography>
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
                                        • 0-4 anos: Lactentes e pré-escolares
                                        <br />
                                        • 5-9 anos: Escolares iniciais
                                        <br />
                                        • 10-14 anos: Pré-adolescentes
                                        <br />
                                        • 15-19 anos: Adolescentes
                                    </Typography>
                                }
                            />
                        </ListItem>

                        <ListItem sx={{
                            bgcolor: 'grey.50',
                            mb: 1,
                            borderRadius: 1,
                            width: '100%',
                            boxSizing: 'border-box'
                        }}>
                            <ListItemText
                                primary={
                                    <Typography
                                        variant="h6"
                                        color="#009689"
                                        fontWeight="bold"
                                        sx={{
                                            wordWrap: 'break-word',
                                            overflowWrap: 'break-word'
                                        }}
                                    >
                                        Grupos Adultos
                                    </Typography>
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
                                        • 20-24 anos: Adultos jovens
                                        <br />
                                        • 25-29 anos: Adultos em idade reprodutiva
                                        <br />
                                        • 30-34 anos: Adultos de meia-idade
                                        <br />
                                        • 35-39 anos: Adultos maduros
                                    </Typography>
                                }
                            />
                        </ListItem>
                    </List>
                </Box>
            </Paper>

            {/* Drug Analysis */}
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
                    Análise por Medicamento
                </Typography>

                <Box sx={{ mt: 2 }}>
                    <List>
                        <ListItem sx={{
                            bgcolor: '#ffebee',
                            mb: 1,
                            borderRadius: 1,
                            border: '1px solid #f54a00',
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
                                                backgroundColor: '#f54a00',
                                                borderRadius: 0.5
                                            }}
                                        />
                                        <Typography
                                            sx={{ fontWeight: 'bold' }}
                                        >
                                            Resistente
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
                                        Amostras com resultado positivo para MTB (cor laranja-vermelha)
                                        <br />
                                        • Indica presença de Mycobacterium tuberculosis
                                        <br />
                                        • Requer análise de sensibilidade aos medicamentos
                                    </Typography>
                                }
                            />
                        </ListItem>

                        <ListItem sx={{
                            bgcolor: '#e8f5f3',
                            mb: 1,
                            borderRadius: 1,
                            border: '1px solid #009689',
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
                                                backgroundColor: '#009689',
                                                borderRadius: 0.5
                                            }}
                                        />
                                        <Typography
                                            sx={{ fontWeight: 'bold' }}
                                        >
                                            Sensível
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
                                        Amostras com resultado negativo para MTB (cor verde-azulada)
                                        <br />
                                        • Não foi detectado Mycobacterium tuberculosis
                                        <br />
                                        • Resultado normal ou outras condições
                                    </Typography>
                                }
                            />
                        </ListItem>

                        <ListItem sx={{
                            bgcolor: '#e3f2fd',
                            mb: 1,
                            borderRadius: 1,
                            border: '1px solid #104e64',
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
                                                backgroundColor: '#104e64',
                                                borderRadius: 0.5
                                            }}
                                        />
                                        <Typography
                                            sx={{ fontWeight: 'bold' }}
                                        >
                                            Indeterminado
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
                                        Amostras com erros durante o processamento (cor azul escuro)
                                        <br />
                                        • Falhas técnicas ou de equipamento
                                        <br />
                                        • Requer repetição do teste
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
                    variant="h6"
                    gutterBottom
                    color="#009689"
                    fontWeight="bold"
                    sx={{
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word'
                    }}
                >
                    Funcionalidades Principais
                </Typography>

                <Box sx={{ mt: 2 }}>
                    <List>
                        <ListItem>
                            <Timeline sx={{ color: 'primary.main', mr: 2 }} />
                            <ListItemText
                                primary="Análise Bidimensional"
                                secondary="Combinação de dados de resistência por medicamento e distribuição etária"
                            />
                        </ListItem>

                        <ListItem>
                            <Assessment sx={{ color: 'primary.main', mr: 2 }} />
                            <ListItemText
                                primary="Gráfico Empilhado por Idade"
                                secondary="Visualização clara dos padrões de resistência específicos por faixa etária"
                            />
                        </ListItem>

                        <ListItem>
                            <Info sx={{ color: 'primary.main', mr: 2 }} />
                            <ListItemText
                                primary="Análise Epidemiológica"
                                secondary="Identificação de vulnerabilidades específicas por grupo etário"
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
                    variant="h6"
                    gutterBottom
                    color="#009689"
                    fontWeight="bold"
                    sx={{
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word'
                    }}
                >
                    Como Utilizar
                </Typography>

                <Box sx={{ mt: 2 }}>
                    <Typography
                        gutterBottom
                        color="secondary.main"
                        sx={{
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word'
                        }}
                    >
                        1. Seleção do Período
                    </Typography>
                    <Typography
                        paragraph
                        sx={{
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word'
                        }}
                    >
                        • Use o filtro de datas para selecionar o período de análise
                        <br />
                        • O subtítulo dinâmico mostra automaticamente o intervalo selecionado em português
                    </Typography>

                    <Typography
                        gutterBottom
                        color="secondary.main"
                        sx={{
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word'
                        }}
                    >
                        2. Interpretação do Gráfico
                    </Typography>
                    <Typography
                        paragraph
                        sx={{
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word'
                        }}
                    >
                        • Eixo X: Grupos etários (0-4, 5-9, 10-14, etc.)
                        <br />
                        • Eixo Y: Número de casos por categoria
                        <br />
                        • Cores: MTB Detetado (laranja-vermelho), MTB Não Detetado (verde-azulado), Erros/Inválidos (azul escuro/amarelo)
                        <br />
                        • Cada barra mostra a distribuição por faixa etária
                    </Typography>

                    <Typography
                        gutterBottom
                        color="secondary.main"
                        sx={{
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word'
                        }}
                    >
                        3. Análise de Padrões
                    </Typography>
                    <Typography
                        paragraph
                        sx={{
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word'
                        }}
                    >
                        • Compare a distribuição entre diferentes faixas etárias
                        <br />
                        • Identifique grupos com maior incidência de casos positivos
                        <br />
                        • Analise padrões de resistência específicos por idade
                    </Typography>

                    <Typography
                        gutterBottom
                        color="secondary.main"
                        sx={{
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word'
                        }}
                    >
                        4. Exportação de Dados
                    </Typography>
                    <Typography
                        sx={{
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word'
                        }}
                    >
                        • <strong>Excel:</strong> Exporta dados com distribuição por idade e medicamento
                        <br />
                        • <strong>Imagem:</strong> Exporta o gráfico empilhado como ficheiro PNG
                    </Typography>
                </Box>
            </Paper>

            {/* Clinical Applications */}
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
                    Aplicações Clínicas
                </Typography>

                <Box sx={{ mt: 2 }}>
                    <Typography
                        variant="body1"
                        paragraph
                        sx={{
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word'
                        }}
                    >
                        Este relatório é fundamental para:
                    </Typography>
                    <List>
                        <ListItem sx={{
                            bgcolor: 'grey.50',
                            mb: 1,
                            borderRadius: 1,
                            width: '100%',
                            boxSizing: 'border-box'
                        }}>
                            <ListItemText
                                primary="Estratégias Pediátricas"
                                secondary="Desenvolvimento de protocolos específicos para tratamento de TB em crianças e adolescentes"
                            />
                        </ListItem>
                        <ListItem sx={{
                            bgcolor: 'grey.50',
                            mb: 1,
                            borderRadius: 1,
                            width: '100%',
                            boxSizing: 'border-box'
                        }}>
                            <ListItemText
                                primary="Vigilância Epidemiológica"
                                secondary="Monitorização de padrões etários de resistência e identificação de grupos vulneráveis"
                            />
                        </ListItem>
                        <ListItem sx={{
                            bgcolor: 'grey.50',
                            mb: 1,
                            borderRadius: 1,
                            width: '100%',
                            boxSizing: 'border-box'
                        }}>
                            <ListItemText
                                primary="Planeamento de Saúde Pública"
                                secondary="Orientação de campanhas de prevenção e programas direcionados por faixa etária"
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
                    variant="h6"
                    gutterBottom
                    color="#009689"
                    fontWeight="bold"
                    sx={{
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word'
                    }}
                >
                    Notas Técnicas
                </Typography>

                <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography
                        variant="body2"
                        sx={{
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word'
                        }}
                    >
                        <strong>Fonte de Dados:</strong> API endpoint `/tb/gx/facilities/tested_samples_disaggregated_by_drug_and_age/`
                    </Typography>
                </Alert>

                <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography
                        variant="body2"
                        sx={{
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word'
                        }}
                    >
                        <strong>Estrutura de Dados:</strong> Dados organizados por faixa etária e perfil de resistência por medicamento
                    </Typography>
                </Alert>

                <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography
                        variant="body2"
                        sx={{
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word'
                        }}
                    >
                        <strong>Timeout:</strong> As consultas têm um limite de 60 segundos com mecanismo de retry automático
                    </Typography>
                </Alert>

                <Alert severity="success">
                    <Typography
                        variant="body2"
                        sx={{
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word'
                        }}
                    >
                        <strong>Actualização:</strong> Os dados são actualizados automaticamente quando se altera qualquer filtro ou tab
                    </Typography>
                </Alert>
            </Paper>

            {/* Footer */}
            <Paper elevation={1} sx={{
                p: 2,
                bgcolor: 'grey.50',
                textAlign: 'center',
                width: '100%',
                boxSizing: 'border-box'
            }}>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word'
                    }}
                >
                    Sistema OpenLDR - Relatório de Amostras Testadas por Medicamento e Idade
                    <br />
                    Para suporte técnico, contacte a equipa de desenvolvimento
                </Typography>
            </Paper>
        </Box>
    );
};

export default MTBTestedSamplesDisaggregatedByDrugAndAgeDocs;
