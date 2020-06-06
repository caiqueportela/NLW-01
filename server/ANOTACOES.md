# Anotações NODE.js

### Geral

- **-D** ou **--save-dev** serve para definir o pacote como ambiente de desenvolvimento.

### express

Framework para desenvolvimento web.

Deve ser executado em desenvolvimento e produção.

```
npm install express
```

### TypeScript

Para a IDE e o compilador entenderem o typescript, precisamos instala-lo:
```
npm install typescript -D
```

E para iniciar o projeto como type script, utilizamos:
```
npx tsc --init
```
Assim será criado o arquivo **tsconfig.json** com as configurações padrão.

### Types

Definições de linguagens e ou frameworkspara o Typescript saber ajudar a completar código e apontar erros:
```
npm install @types/express -D
```

### Executar servidor

Para executar o código, precisamos instalar um pacote que consiga rodar node com TypeScript (Por padrão o node funciona com JS):
```
npm install ts-node -D
```

E para rodar fazemos:
```
npx ts-node src/server.ts
```

**npx** é o comando de atalho pra executar binários instalados no node_modules.

Porém, com esse pacote precisamos parar a execução e reiniar a cada mudança.

Para deixar em tempo real, em livereload, utlizamos um de desenvolvimento:
```
npm install ts-node-dev -D
```

E para rodar:
```
npx ts-node-dev src/server.ts
```

