# Serverless Website Change Monitor

## Setup

### Install node modules

`pnpm install`

### Install global packages and CLIs

#### AWS CLI
You may need to setup the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) and login to an account to use Serverless

#### tsc / TypeScript
`pnpm i -g tsc`

#### Serverless (optional)
`pnpm i -g serverless`

It is installed as a package, so it can also be run using `npx serverless`, but I prefer to have it installed globally

#### Docker (optional)
If you want to use Docker for the MongoDB instance, you will need to install it first. Instructions can be found [here](https://docs.docker.com/engine/install/)

## Development
> ℹ️ All the `pnpm` commands can also be run with `npm`

### Start developing the app

#### Set node version
If you are using `nvm` you can run `nvm use` to set the the correct node version. Otherwise the node engine can be found in the `package.json` file

#### Start TypeScript compiler

`pnpm run dev`

#### Start a MongoDB instance

`docker-compose up -d`

You'll need to have a MongoDB instance running. I prefer to use a docker container, but you can set it up as you please

#### Testing with `Jest`

`pnpm run test` to start `jest` in watch mode

You can also just use `jest` however you please

### Running "lambda" locally
`pnpm run start:test` to build and run the function locally

`serverless offline` to emmulate real functionality locally. Assumes you have already compiled TypeScript files to JavaScript files in the `/dist` folder

## Building and deploying

#### 1. Build with `tsc`

`pnpm run build`

#### 2. Deploy to serverless

`serverless deploy`
