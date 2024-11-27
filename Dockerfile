FROM nginx

ENV API_URL=http://localhost:3000

COPY dist /usr/share/nginx/html

RUN rm /etc/nginx/conf.d/default.conf.template

COPY cicd/nginx/default.conf.template /etc/nginx/conf.d

CMD envsubst '$API_URL' < /etc/nginx/templates/nginx.conf.template > /etc/nginx/nginx.conf && nginx -g 'daemon off;'

EXPOSE 80