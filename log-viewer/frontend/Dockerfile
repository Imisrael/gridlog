FROM node:lts as build

WORKDIR /app
COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
COPY tailwind.config.js /app/tailwind.config.js
COPY postcss.config.js /app/postcss.config.js

RUN npm ci
RUN npm install react-scripts@3.4.1 -g --silent
COPY src /app/src
COPY public /app/public

RUN ["npm", "run", "build"]

FROM nginx

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/
EXPOSE 2828
CMD ["nginx", "-g", "daemon off;"]