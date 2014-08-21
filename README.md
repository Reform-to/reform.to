# Reform.to App Website

## Requirements

* Node.js
* Grunt - `npm install -g grunt-cli`
* Bower - `npm install -g bower`

## Installation

    npm install
    bower install

## Updating

To update dependencies (such as `candidate-photos`), run the command:

    bower update

## Development

    grunt

### Server

    grunt server

This task will compile and run the app on `http://localhost:9001`.

## Deployment

    bower update
    grunt dist

The compiled app will be built in the `dist/` directory, and can be deployed to
a static server in production.
