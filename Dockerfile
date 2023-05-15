FROM ubuntu:20.04

RUN apt-get update && \ 
    apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_14.x | bash - && \
    apt-get install -y nodejs

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 6060

CMD ["npm", "start"]