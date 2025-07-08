
# 🌤️ Sistema Meteorológico Inteligente - PE

Este é um sistema web completo e automatizado para previsão do tempo com foco no estado de Pernambuco (PE). O sistema atende inicialmente **todas as cidades com mais de 50 mil habitantes**, com suporte a:

- ✅ Previsão meteorológica por latitude e longitude
- ✅ Envio de alertas personalizados via WhatsApp
- ✅ Campanhas automatizadas de monetização 1x ao dia
- ✅ Painel de administração com cadastro de cidades e usuários

---

## 🧠 Tecnologias

- Next.js 14
- TailwindCSS 4
- Supabase (Auth + DB + RLS)
- Prisma ORM
- Twilio API (ou similar) para WhatsApp
- Axios para integrações
- Vercel para deploy

---

## 🛠️ Instalação Local

```bash
git clone https://github.com/seu-usuario/smi-pe.git
cd smi-pe
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npm run dev

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
