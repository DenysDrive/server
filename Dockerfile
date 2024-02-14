FROM node:21
WORKDIR server
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 57002
CMD ["node", "app.js"]
