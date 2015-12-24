FROM node:0.10

WORKDIR /app/
ADD . /app/

RUN npm install

CMD npm run test
