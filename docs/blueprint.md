# **App Name**: Real Profit Analyzer

## Core Features:

- Data Input Form: Create an intuitive form for entering product information, applicable taxes, and fixed/variable costs.
- Automated Calculations: Automatically calculate individual taxes, sum costs, determine total cost per unit, calculate Real Profit, and calculate the profit margin percentage.
- Results Visualization: Display a detailed table with product value, tax breakdown, cost breakdown, and net value (Real Profit). Also, generate interactive charts showing price composition and component comparisons using Recharts.

## Style Guidelines:

- Primary colors: Tones of blue, gray, and white for a professional corporate environment.
- Accent color: Use a muted green (#8FBC8F) for highlights and action buttons.
- Divide the interface into logical steps for easy navigation.
- Use clear and concise icons to represent different data inputs and results.
- Provide visual feedback during interaction with hover, focus, and validation effects.

## Original User Request:
Objetivo do Projeto

Desenvolva um site completo utilizando NextJS que permita empresas e profissionais calcularem com precisão o Lucro Real de suas operações comerciais, contemplando impostos e diversos custos associados.

Especificações Técnicas

Framework: NextJS (versão mais recente)
Biblioteca de visualização: Recharts para geração de gráficos
Estilização: Tailwind CSS ou styled-components (escolha o que melhor se adequar)
Responsividade: Design adaptável para mobile, tablet e desktop
Armazenamento: Local (sem necessidade de backend/banco de dados)

Funcionalidades Essenciais

1. Formulário de Entrada de Dados

Crie um formulário intuitivo com os seguintes campos:

Informações do Produto:

Nome do produto (texto)
Valor do produto (numérico)
Quantidade (numérico)


Impostos Aplicáveis (seção dinâmica, permitindo adicionar/remover impostos):

Nome do imposto (ex.: ICMS, PIS, COFINS, IPI)
Alíquota (percentual)
Base de cálculo (dropdown: sobre valor total, sobre valor com outros impostos, etc.)


Custos Fixos e Variáveis (seção dinâmica para adicionar/remover custos):

Nome do custo (ex.: Frete, Embalagem, Marketing)
Valor (numérico)
Tipo (dropdown: fixo ou variável por unidade)

2. Cálculos Automáticos

Ao submeter o formulário, o sistema deve:

Calcular cada imposto individualmente conforme sua base de cálculo
Somar todos os custos fixos e variáveis
Determinar o custo total por produto/unidade
Calcular o Lucro Real (valor de venda - impostos - custos)
Calcular a margem de lucro percentual

3. Visualização dos Resultados

Tabela detalhada com:

Valor bruto do produto
Detalhamento de cada imposto (nome, base de cálculo, valor)
Detalhamento de cada custo (fixo e variável)
Valor líquido (Lucro Real)


Gráficos interativos usando Recharts:

Gráfico de pizza mostrando a composição do preço (produto, impostos, custos, lucro)
Gráfico de barras comparando os diferentes componentes
Opção para exportar ou compartilhar os gráficos

4. Recursos Adicionais

Função para salvar/carregar diferentes cenários de cálculo
Botão para limpar todos os campos
Função de simulação: slider para ajustar valores e ver os resultados em tempo real
Seção de ajuda com exemplos práticos

Requisitos de Interface

Design limpo e profissional, adequado para ambiente corporativo
Esquema de cores sóbrias (sugiro tons de azul, cinza e branco)
Tipografia de fácil leitura
Feedback visual durante a interação (hover, focus, validação)
Interface dividida em etapas lógicas com possibilidade de navegação entre elas

Requisitos de Código

Organização modular e componentização para facilitar manutenção
Documentação detalhada das funções, especialmente as que realizam cálculos fiscais
Comentários explicativos para a lógica de negócio complexa
Validação completa de todos os inputs:Impedir valores negativos
Validar campos obrigatórios
Confirmar alíquotas em formato percentual válido
Mostrar mensagens de erro contextuais

Dados para Teste

Inclua um conjunto de dados pré-configurados para demonstração rápida:

Exemplo 1: Produto de varejo com ICMS, PIS e COFINS
Exemplo 2: Produto industrial com IPI e outros impostos
Exemplo 3: Serviço com ISS e retenções

Entregáveis

Código-fonte completo do projeto NextJS organizado nas pastas padrão:

/pages
/components
/styles
/utils (para funções de cálculo)
/hooks (hooks personalizados se necessário)


Arquivo README.md com:

Instruções de instalação e execução
Explicação das principais funcionalidades
Documentação das fórmulas de cálculo utilizadas


Arquivos package.json configurados com todas as dependências necessárias


Demonstração do site funcional em um ambiente de staging ou em imagens/vídeos

Observações Finais

O código deve ser performático e otimizado
A aplicação não precisa persistir dados em banco, mas deve manter os dados na sessão do usuário
Priorize a precisão dos cálculos e a clareza na apresentação dos resultados
Use boas práticas de acessibilidade para garantir que o site seja utilizável por todos
  