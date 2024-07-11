# Serverless YouTube View Count Monitor

This is a test, and only monitor a YouTube video and report on the view count. Ideally this would be able to be used for more use cases

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

### ENV variables and accounts for deploying

#### AWS

If you haven't already, you will need to use `aws configure` to add AWS credentials for a user in your AWS account

#### Google sheet creation

1. Create a Google Sheet
2. Add the email for the service account (see steps for Google API below) to users allowed to edit the document
3. Save the link of this Google Sheet for the `.env` file

#### Google APIs

1. Create a new project in [Google Cloud Console under APIs and Services](https://console.cloud.google.com/apis)
2. Enable Google APIs for Google Sheets
3. Create a service account
4. Add the email created for that service account to the users the public Google Sheet is shared with

#### Serverless

Run `serverless` (if you installed globally) or `npx serverless` otherwise, _after_ you've set your AWS credentials, using the AWS CLI

#### Ethereal

You can make yourself a free email for testing [here](https://ethereal.email)

#### ENV file

`cp .env.example .env` to create an env file from the example file, and then fill it in with credentials and global variables

## Development

> ℹ️ All the `pnpm` commands can also be run with `npm`

### Start developing the app

#### Set node version

If you are using `nvm` you can run `nvm use` to set the correct node version. Otherwise the node engine can be found in the `package.json` file

#### Start TypeScript compiler

`pnpm run dev`

#### Start a MongoDB instance

`docker-compose up -d`

You'll need to have a MongoDB instance running. I prefer to use a docker container, but you can set it up as you please

#### Testing with `Jest`

`pnpm run test` to start `jest` in watch mode

You can also just use `jest` however you please

### Running "lambda" locally

`pnpm run start:test` to build and run the function locally. This assume you have docker installed. If you don't, you can run `serverless offline`

`serverless offline` to emulate real functionality locally. Assumes you have already compiled TypeScript files to JavaScript files in the `/dist` folder

## Building and deploying

#### 1. Build with `tsc`

`pnpm run build`

#### 2. Deploy to serverless

`serverless deploy`
