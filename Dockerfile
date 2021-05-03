FROM node:14

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install
RUN npm i -g nodemon
COPY . .

CMD [ "nodemon", "app.js" ]