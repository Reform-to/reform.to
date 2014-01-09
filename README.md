# Anti-Corruption Pledge

## Requirements

* Node.js
* Grunt - `npm install -g grunt-cli`
* Bower - `npm install -g bower`

## Installation

    npm install
    bower install

## Development

    grunt

### Server

    grunt server

This task will compile and run the app on `http://localhost:9001`.

## Deployment

    grunt dist

The compiled app will be built in the `dist/` directory, and can be deployed to
a static server in production.
