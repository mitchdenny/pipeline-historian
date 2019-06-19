FROM node:10
WORKDIR /usr/src/app
RUN apt-get install nginx
COPY package*.json ./
RUN npm ci
COPY . .
CMD ["npm", "start"]