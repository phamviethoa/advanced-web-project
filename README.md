# advanced-web-project

## Prerequisite

Node version should be v14. We use nvm to mange node version, please follow `https://github.com/nvm-sh/nvm#installing-and-updating` to install

> nvm use v14

> npm install -g typescript

> npm install --global lerna

> npm i -g @nestjs/cli

## How to run

1. Install all dependencies

> lerna bootstrap

2. Run postgres (Install Docker first)

> npm run postgres

3. If you develop both frontend & backend

> npm run dev

- If you want to develop backend

> npm run backend

- If you want to develop frontend

> npm run frontend

## Install a package

Notice that you can only add one package at a time. For example:

> lerna add react-redux --scope=@ontest/frontend

> lerna add @types/react-redux --scope=@ontest/frontend --dev
