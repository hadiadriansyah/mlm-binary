FROM node:22-alpine

WORKDIR /app

# # PRODUCTION

# COPY . .

# RUN npm install
# RUN npm run build

# EXPOSE 3000

# CMD ["npm", "run", "start"]


# Development

COPY package*.json ./

RUN npm install

COPY . .

ENV CHOKIDAR_USEPOLLING=true

EXPOSE 3000

CMD ["npm", "run", "dev"]