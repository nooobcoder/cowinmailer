FROM node:14-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY . .

RUN npm install
RUN npm install -g nodemon

CMD [ "nodemon", "--ignore", "output.json", "app.js" ]
