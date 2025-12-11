================================================================================
                                  iTASKS
                    Sistema de Gestão de Tarefas (Kanban)
                          React Native + Firebase
================================================================================

================================================================================
                           ELEMENTOS DO GRUPO
================================================================================

    Nome: Martim Pinto
    Número: 2024523

    Nome: Guilherme Hutchinson
    Número: 2024541

    Unidade Curricular: Laboratório de Desenvolvimento 2

================================================================================
                          DESCRIÇÃO DO PROJETO
================================================================================

O iTasks é uma aplicação móvel de gestão de tarefas baseada no sistema Kanban,
desenvolvida em React Native com Firebase como backend. A aplicação permite
a gestão de equipas de desenvolvimento, com dois tipos de utilizadores:

    - Gestor: Pode criar/editar tarefas, gerir utilizadores e exportar dados
    - Programador: Pode visualizar e atualizar o estado das suas tarefas

Funcionalidades principais:
    - Autenticação de utilizadores (login/logout)
    - Quadro Kanban com 3 colunas (ToDo, Doing, Done)
    - Criação e edição de tarefas (apenas Gestor)
    - Gestão de utilizadores (apenas Gestor)
    - Exportação de tarefas concluídas para CSV
    - Edição de perfil de utilizador
    - Limite de 2 tarefas em "Doing" por programador

================================================================================
                             PRÉ-REQUISITOS
================================================================================

Antes de iniciar a instalação, certifique-se de que tem instalado:

    1. Node.js (versão 18 ou superior)
       - Download: https://nodejs.org/

    2. npm (incluído com Node.js) ou Yarn
       - Verificar versão: npm --version

    3. Expo CLI
       - Instalação: npm install -g expo-cli

    4. Expo Go (aplicação móvel para testes)
       - Android: Google Play Store
       - iOS: App Store

    5. Git (opcional, para clonar o repositório)
       - Download: https://git-scm.com/

================================================================================
                              INSTALAÇÃO
================================================================================

1. CRIAR O PROJETO
   ----------------
   Abra o terminal e execute:

       npx create-expo-app iTasks
       cd iTasks

2. INSTALAR DEPENDÊNCIAS
   ----------------------
   Execute os seguintes comandos:

       npm install firebase
       npm install @react-native-async-storage/async-storage

3. COPIAR O CÓDIGO
   ----------------
   Substitua o conteúdo do ficheiro App.tsx (ou App.js) pelo código
   fornecido no ficheiro iTasks_Firebase_Completo.tsx

4. VERIFICAR ESTRUTURA DO PROJETO
   -------------------------------
   A estrutura deve ser semelhante a:

       iTasks/
       ├── App.tsx (código principal da aplicação)
       ├── package.json
       ├── node_modules/
       ├── assets/
       └── ...

================================================================================
                        CONFIGURAÇÃO DO FIREBASE
================================================================================

1. CRIAR PROJETO NO FIREBASE
   --------------------------
   a) Aceder a https://console.firebase.google.com/
   b) Clicar em "Adicionar projeto"
   c) Dar um nome ao projeto (ex: iTasks)
   d) Seguir os passos de configuração

2. CONFIGURAR AUTHENTICATION
   --------------------------
   a) No menu lateral, clicar em "Authentication"
   b) Clicar em "Começar"
   c) Ativar o método "Email/Password"
   d) Guardar as alterações

3. CONFIGURAR FIRESTORE DATABASE
   ------------------------------
   a) No menu lateral, clicar em "Firestore Database"
   b) Clicar em "Criar base de dados"
   c) Selecionar modo de produção ou teste
   d) Escolher a localização (ex: europe-west1)

4. CONFIGURAR REGRAS DO FIRESTORE
   --------------------------------
   No separador "Rules" do Firestore, inserir as seguintes regras:

   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read: if request.auth != null;
         allow create: if request.auth != null;
         allow update, delete: if request.auth != null;
       }
       match /tasks/{taskId} {
         allow read: if request.auth != null;
         allow create: if request.auth != null;
         allow update, delete: if request.auth != null;
       }
     }
   }

   Clicar em "Publicar" para aplicar as regras.

5. OBTER CONFIGURAÇÕES DO FIREBASE
   ---------------------------------
   a) Nas configurações do projeto, adicionar uma app Web
   b) Copiar o objeto firebaseConfig
   c) Substituir no código da aplicação (linhas 20-27)

   Exemplo de configuração:

       const firebaseConfig = {
         apiKey: "SUA_API_KEY",
         authDomain: "SEU_PROJETO.firebaseapp.com",
         projectId: "SEU_PROJETO",
         storageBucket: "SEU_PROJETO.appspot.com",
         messagingSenderId: "SEU_SENDER_ID",
         appId: "SEU_APP_ID"
       };

6. CRIAR UTILIZADOR GESTOR INICIAL
   ---------------------------------
   Para criar o primeiro utilizador Gestor, pode:

   a) Usar a Firebase Console:
      - Authentication > Adicionar utilizador
      - Criar utilizador com email e password
      - Copiar o UID gerado

      - Firestore Database > Iniciar coleção "users"
      - Adicionar documento com ID = UID do utilizador
      - Campos:
          uid: "UID_DO_UTILIZADOR"
          username: "Admin"
          email: "admin@email.com"
          type: "Gestor"
          createdAt: (timestamp atual)

================================================================================
                         EXECUÇÃO DA APLICAÇÃO
================================================================================

1. INICIAR O SERVIDOR DE DESENVOLVIMENTO
   --------------------------------------
   No diretório do projeto, execute:

       npx expo start

   Ou para plataformas específicas:

       npx expo start --android
       npx expo start --ios
       npx expo start --web

2. EXECUTAR NO DISPOSITIVO MÓVEL
   ------------------------------
   a) Instalar a app "Expo Go" no telemóvel
   b) Ler o QR Code apresentado no terminal
   c) A aplicação será carregada automaticamente

3. EXECUTAR NO EMULADOR
   ----------------------
   Android:
       - Ter o Android Studio instalado com um AVD configurado
       - Pressionar 'a' no terminal do Expo

   iOS (apenas macOS):
       - Ter o Xcode instalado
       - Pressionar 'i' no terminal do Expo

4. EXECUTAR NO BROWSER (Web)
   --------------------------
   - Pressionar 'w' no terminal do Expo
   - A aplicação abrirá no browser predefinido

================================================================================
                          CREDENCIAIS DE TESTE
================================================================================

Após configurar o Firebase e criar os utilizadores, pode usar:

    GESTOR (Administrador):
    -----------------------
    Email: [email do gestor criado]
    Password: [password definida]

    PROGRAMADOR:
    ------------
    (Criar através da interface do Gestor na app)

================================================================================
                         ESTRUTURA DA BASE DE DADOS
================================================================================

COLEÇÃO: users
--------------
Documento (ID = UID do Firebase Auth):
    {
        uid: string,
        username: string,
        email: string,
        type: "Gestor" | "Programador",
        createdAt: timestamp
    }

COLEÇÃO: tasks
--------------
Documento (ID automático):
    {
        title: string,
        assignedTo: string (UID do programador),
        managerId: string (UID do gestor que criou),
        sp: number (Story Points),
        type: "Feature" | "Bug" | "Setup",
        status: "ToDo" | "Doing" | "Done",
        createdAt: timestamp,
        actualStart: timestamp | null,
        actualEnd: timestamp | null
    }

================================================================================
                           RESOLUÇÃO DE PROBLEMAS
================================================================================

ERRO: "Missing or insufficient permissions"
-------------------------------------------
Causa: Regras do Firestore não configuradas corretamente.
Solução: Verificar e atualizar as regras conforme secção 4 da configuração.

ERRO: "auth/user-not-found"
---------------------------
Causa: Utilizador não existe no Firebase Authentication.
Solução: Criar o utilizador na Firebase Console ou através da app.

ERRO: "Network request failed"
------------------------------
Causa: Problemas de conectividade ou configuração do Firebase.
Solução: 
    - Verificar ligação à internet
    - Confirmar que o firebaseConfig está correto
    - Verificar se o projeto Firebase está ativo

A APLICAÇÃO NÃO CARREGA
-----------------------
Soluções:
    - Limpar cache: npx expo start --clear
    - Reinstalar dependências: rm -rf node_modules && npm install
    - Verificar versão do Node.js

================================================================================
                            TECNOLOGIAS UTILIZADAS
================================================================================

    - React Native (Framework de desenvolvimento móvel)
    - Expo (Plataforma de desenvolvimento)
    - Firebase Authentication (Autenticação de utilizadores)
    - Cloud Firestore (Base de dados NoSQL)
    - AsyncStorage (Persistência local)
    - TypeScript (Linguagem de programação)

================================================================================
                              VERSÕES TESTADAS
================================================================================

    - Node.js: 18.x / 20.x
    - Expo SDK: 50.x / 51.x
    - React Native: 0.73.x
    - Firebase: 10.x

================================================================================
                                 LICENÇA
================================================================================

Este projeto foi desenvolvido no âmbito da unidade curricular de
Laboratório de Desenvolvimento 2.

================================================================================
                               FIM DO DOCUMENTO
================================================================================
