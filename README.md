# Try out MongoDB with mongoose APIs and GraphQL

## yarn commands
1 yarn start
Starts the express graphql server with a GUI interface, which can be accessed
at http://localhost:3001/graphql
You should run `yarn build` before running this command

2 yarn build:w
This builds the src directory, output it to dist directory, and watch any
changes within src and rebuild

3 yarn build
Like yarn build:w, just don't watch changes

## config.js
MongoDB configs, mostly configures the database connection

## schemas.js
Define a set of database table schemas

## init_db.js
Initialize the database with schema and documents

## queries.js
Perform database queries via mongoose APIs

## For trying out GraphQL
Install, build and run:

```
yarn install
yarn run build
yarn start
```
this uses Express.js and graphql middlewares, it provides a graphical
interface for you to try out GraphQL queries
