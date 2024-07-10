# Serverless Website Change Monitor

## Setup

### 1. Install node modules

`pnpm install`

### 2. Install global packages

- Serverless
- AWS

If you don't have serverless, or AWS setup, you will need to install their CLIs locally, and create credentials for AWS, _maybe serverless too, I think you need to at least sign in_

## Development

### 1. Start TypeScript compiler

`pnpm run dev`

### 2. Start a MongoDB instance

You'll need to have a MongoDB instance running. I prefer to use a docker container, but you can set it up as you please

## Testing

`pnpm run test`

You can also just use `jest` however you please

## Building and deploying

### 1. Build with `tsc`

`pnpm run build`

### 2. Test the functions offline using

`serverless offline`

### 3.Deploy to serverless

`serverless deploy`
