Relatório Final: Projeto Agiliza - Intelligent Vulnerability Triage Tool

1. Visão Geral e Regras de Negócio

1.1. Objetivo do Sistema

O Intelligent Vulnerability Triage Tool é uma solução de segurança projetada para combater a "fadiga de alertas" em ambientes DevSecOps. Seu objetivo principal é utilizar Inteligência Artificial (Machine Learning) para analisar e priorizar automaticamente vulnerabilidades de segurança detectadas por scanners (como OWASP Dependency-Check), distinguindo entre riscos críticos reais e falsos positivos ou alertas de baixa relevância.

1.2. Regras de Negócio

Priorização Inteligente: Vulnerabilidades não são classificadas apenas pelo CVSS, mas analisadas semanticamente por modelos de IA (Naive Bayes ou BERT) para determinar a probabilidade real de exploração.

Enriquecimento de Dados: Toda vulnerabilidade identificada deve ser enriquecida, quando possível, com dados externos (NVD e EPSS) para validar sua severidade.

Segurança de Acesso: O uso da ferramenta via interface web requer autenticação por sessão. O uso via API requer uma chave de API (API Key) válida e ativa.

Fallback Resiliente: Em caso de falha ou indisponibilidade do modelo de IA avançado (BERT), o sistema deve degradar graciosamente para o modelo base (Naive Bayes) ou para uma heurística baseada em regras, garantindo que o usuário sempre receba uma resposta.

Privacidade de Dados: Dados sensíveis dos relatórios não devem ser retidos por mais tempo que o necessário para a análise (cache com TTL).

1.3. Usuários em Potencial (Personas)

Engenheiro de Segurança (Security Analyst): Precisa filtrar milhares de alertas para focar nos 5-10% que representam risco real à infraestrutura.

Desenvolvedor (DevSecOps): Deseja feedback rápido no pipeline de CI/CD sobre se uma nova dependência introduziu uma falha crítica, sem esperar dias por uma revisão manual.

Gerente de Engenharia: Precisa de métricas sobre a postura de segurança e a eficiência do time na correção de falhas.

2. Definição dos Requisitos

2.1. Épicos

Gestão de Identidade e Acesso: Controle de quem pode acessar a ferramenta e gerar chaves de API.

Motor de Triagem e Inferência: O núcleo de IA que processa descrições de vulnerabilidades.

Gestão de Relatórios e Dashboard: Interface para upload de arquivos e visualização amigável dos resultados.

Integração e Enriquecimento: Conexão com fontes externas de dados de segurança.

2.2. Histórias de Usuário (HU) e Tasks

Épico 1: Gestão de Identidade

HU-01: Como usuário, quero criar uma conta e fazer login para acessar o sistema de forma segura.

Task: Criar modelos de banco de dados para Usuários (app/models/user.py).

Task: Implementar rotas de Login/Registro com Flask-Login (app/auth_routes.py).

Task: Criar templates HTML para formulários de acesso.

HU-02: Como desenvolvedor, quero gerar uma API Key para integrar a ferramenta ao meu pipeline CI/CD.

Task: Implementar lógica de geração de token seguro (secrets.token_urlsafe).

Task: Criar interface de perfil para visualizar/revogar chaves.

Épico 2: Motor de Triagem

HU-03: Como analista, quero que o sistema classifique automaticamente a severidade baseada na descrição do problema.

Task: Treinar modelo Naive Bayes com dataset CVE (scripts/train_naive_bayes.py).

Task: Implementar serviço de inferência com padrão Strategy (app/core/inference_service.py).

Task: Implementar modelo BERT para maior precisão (opcional/avançado).

Épico 3: Dashboard

HU-04: Como usuário, quero fazer upload de um relatório JSON (OWASP) e ver os resultados priorizados.

Task: Criar parser para formato OWASP Dependency-Check.

Task: Desenvolver tela de upload com Drag-and-Drop (templates/index.html).

Task: Desenvolver dashboard de resultados com gráficos e tabelas (templates/results.html).

Épico 4: Integração

HU-05: Como analista, quero ver o score EPSS (probabilidade de exploração) junto com a vulnerabilidade.

Task: Criar serviço de integração com API da FIRST.org (app/core/epss_service.py).

Task: Integrar dados do NVD para confirmar CVSS oficial.

2.3. Requisitos Não Funcionais (Atributos de Qualidade)

Desempenho: A inferência do modelo Naive Bayes deve ocorrer em menos de 100ms por item.

Usabilidade: A interface deve ser responsiva (Tailwind CSS) e intuitiva para usuários não técnicos.

Confiabilidade: O sistema deve possuir mecanismos de retry para chamadas externas e fallback caso o Redis ou APIs externas estejam offline.

Manutenibilidade: O código deve seguir a Clean Architecture, separando camadas de apresentação, domínio e infraestrutura.

3. Arquitetura

3.1. Diagrama Arquitetural

O sistema segue uma arquitetura em camadas (Clean Architecture) com serviços desacoplados.

graph TD
    subgraph "Camada de Apresentação (Frontend/API)"
        UI[Interface Web<br/>HTML/Jinja2/Tailwind]
        API[REST API v1<br/>Flask Blueprints]
    end

    subgraph "Camada de Aplicação (Core)"
        AuthService[Serviço de Autenticação]
        InferenceService[Serviço de Inferência IA]
        EnrichmentService[Serviço de Enriquecimento]
    end

    subgraph "Camada de Infraestrutura"
        DB[(SQLite<br/>Usuários/Logs)]
        Redis[(Redis<br/>Cache/Rate Limit)]
        ModelLoader[Carregador de Modelos ML]
    end

    subgraph "Serviços Externos"
        NVD[API NVD NIST]
        EPSS[API FIRST.org]
    end

    UI --> API
    API --> AuthService
    API --> InferenceService
    API --> EnrichmentService
    
    AuthService --> DB
    InferenceService --> Redis
    InferenceService --> ModelLoader
    EnrichmentService --> NVD
    EnrichmentService --> EPSS


3.2. Definição de Tecnologias

Linguagem: Python 3.10+

Framework Web: Flask (Leve, flexível e robusto).

Banco de Dados: SQLite (Simplicidade para o MVP, compatível com SQLAlchemy).

Cache/Filas: Redis (Opcional, com fallback em memória implementado).

Machine Learning: scikit-learn (Naive Bayes) e Transformers/PyTorch (BERT).

Frontend: HTML5, Jinja2 Templating, Tailwind CSS (CDN).

Testes: Pytest com cobertura de código.

3.3. Diagrama de Banco de Dados

Modelo simplificado focado na gestão de usuários e acesso, já que as análises são processadas em tempo real e cacheadas no Redis, sem persistência longa de relatórios (por privacidade).

erDiagram
    USER {
        int id PK
        string username "Unique"
        string password_hash
        string api_key "Indexed, Unique"
        datetime created_at
        boolean is_active
    }


4. Documento Sumarizando

4.1. Objetivo do Sistema

Reduzir o tempo gasto por equipes de segurança na análise manual de vulnerabilidades, provendo uma triagem automatizada que separa o "sinal" do "ruído".

4.2. Regras de Negócio e Personas

O sistema atende Engenheiros de Segurança e Desenvolvedores que operam sob a regra de que "nem todo CVSS alto é uma emergência real". O sistema aplica inteligência para validar o contexto da vulnerabilidade.

4.3. Próximos Passos

Expansão do Dataset de treinamento para cobrir mais linguagens além de Java/Python.

Implementação de Webhooks para notificar Slack/Teams quando uma vulnerabilidade crítica for detectada.

Deploy automatizado em Kubernetes para escalabilidade horizontal do modelo BERT.

5. Telas e Fluxo do Sistema

Fluxo Principal

Login/Registro: O usuário cria uma conta ou entra.

Home/Upload: O usuário faz upload de um arquivo dependency-check-report.json.

Processamento: O backend lê o JSON, extrai descrições, passa pelos modelos de ML e consulta APIs externas.

Resultados: O usuário visualiza uma tabela com as vulnerabilidades re-priorizadas.

Explicação das Telas (Mockup Conceitual)

Tela 1: Upload (Home)

Interface limpa com uma área de "Drag & Drop". Permite ao usuário escolher entre o modelo rápido (Naive Bayes) ou o modelo preciso (BERT).

Ação: Usuário arrasta arquivo JSON e clica em "Analisar".

Tela 2: Dashboard de Resultados

Apresenta cards com métricas no topo:

Total de Vulnerabilidades: Contagem bruta.

Alertas Críticos (IA): Quantos a IA considerou realmente perigosos.

Taxa de Redução: Porcentagem de trabalho economizado (ex: 70%).

Abaixo, uma tabela detalhada com colunas:

Prioridade IA: Crítico, Alto, Médio, Baixo (Colorido).

CVE ID: Link para detalhes.

Score Original vs IA: Comparativo visual.

Enriquecimento: Ícones indicando se há exploit conhecido (EPSS) ou correção disponível.

Tela 3: Perfil e API

Permite ao usuário gerar uma chave de API (sk_...) para usar o sistema via terminal ou script CI/CD, sem precisar da interface gráfica.

6. Entregáveis Finais

6.1. Documentação

Este documento serve como a documentação central dos requisitos funcionais, não funcionais e arquiteturais. A configuração da ferramenta de gerenciamento e instruções de uso estão detalhadas no README.md e CLAUDE.MD presentes no repositório.

6.2. Funcionalidades Desenvolvidas (Checklist)

O MVP entregue contempla as seguintes 5 funcionalidades completas:

✅ Sistema de Autenticação Completo: Login, Registro, Logout e Proteção de Rotas.

✅ API RESTful Segura: Endpoints /api/v1/triage protegidos por API Key.

✅ Motor de Análise Híbrido: Suporte a Naive Bayes (rápido) e BERT (profundo) com fallback automático.

✅ Dashboard Interativo: Visualização de dados com cálculo de redução de ruído em tempo real.

✅ Enriquecimento de Dados: Integração funcional com NVD e EPSS para validação de riscos.

6.3. Deploy e Versionamento

Versionamento: Todo o código fonte está versionado utilizando Git, seguindo padrões de commit semântico.

Ambiente: O projeto está configurado para rodar em containers (Docker ready) ou diretamente em Linux/Windows via script start.sh.

Procedimento de Operação:

# Inicialização rápida
./start.sh
# O sistema estará disponível em http://localhost:5000
