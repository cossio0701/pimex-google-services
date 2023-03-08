FROM node:14-alpine

RUN apk update && apk upgrade

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production
COPY . ./

CMD ["npm", "start"]
