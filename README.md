
# Sistema Meteorológico Inteligente – PE

Sistema web completo e automatizado para previsão do tempo, alertas personalizados e envio de mensagens via WhatsApp, com foco no estado de Pernambuco. Atende inicialmente todas as cidades com mais de 50 mil habitantes, com expansão planejada.

## 🚀 Tecnologias Utilizadas
- **Next.js 14** + React
- **Tailwind CSS**
- **PostgreSQL** (Supabase)
- **Prisma ORM**
- **Twilio API** (envio de WhatsApp)
- **OpenWeatherMap**, **WeatherAPI**, **INMET**, **NOAA/GOES-16**
- **Recharts** (gráficos)

## 📁 Funcionalidades
- Previsão horária e diária por cidade (via coordenadas)
- Painel meteorológico com satélite, radar e gráficos
- Alertas configuráveis (chuva, temperatura, vento)
- Envio automatizado via WhatsApp
- Propaganda diária opcional para rentabilização
- Cadastro de usuários com escolha de cidade e consentimento LGPD

## 🔄 Instalação Local
1. Clone este repositório:
```bash
git clone https://github.com/seu-usuario/sistema-meteo-pe.git
cd sistema-meteo-pe
```

2. Instale as dependências:
```bash
npm install
```

3. Copie o .env.example:
```bash
cp .env.example .env.local
```

4. Configure o banco e gere o Prisma:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

5. Inicie o projeto:
```bash
npm run dev
```

## 🔍 Arquivos Essenciais
- `.env.example`: modelo de variáveis sensíveis
- `schema.prisma`: modelo de banco
- `README.md`: instruções completas

## 💽 APIs e Integrações
- [OpenWeatherMap](https://openweathermap.org/api)
- [WeatherAPI](https://weatherapi.com)
- [INMET RSS/XML](https://portal.inmet.gov.br/servicos/rss)
- [NOAA GOES-16](https://www.star.nesdis.noaa.gov/GOES/index.php)
- [Twilio WhatsApp API](https://www.twilio.com/whatsapp)

## 🌍 Coordenadas e Cidades
- Cidades com mais de 50 mil habitantes (PE) carregadas via Supabase
- Cada usuário é vinculado a uma cidade (latitude/longitude)
- Previsões meteorológicas feitas com base nas coordenadas da cidade

## 💬 Alertas e Propaganda
- Usuário configura tipo de alerta (chuva, vento, temperatura)
- Sistema verifica previsão horária e envia alerta via WhatsApp
- Propagandas são enviadas 1x por dia (com consentimento)

## 📘 LGPD e Consentimento
- Consentimento registrado no banco (com data, meio e aceite)
- Opção de cancelar recebimento com mensagem "SAIR"

## 🚀 Deploy e Produção
- Frontend e backend no [Vercel](https://vercel.com)
- Banco e autenticação no [Supabase](https://supabase.io)
- CI/CD integrado ao GitHub

## 📅 Atualizações Futuras
- Integração com sensores agrícolas
- Previsão climática sazonal
- IA preditiva (TensorFlow.js / Python)
- App mobile (React Native)

## 🌐 Licença
Projeto privado. Todos os direitos reservados. Desenvolvido sob consultoria da Dra. Helena Coutinho.
