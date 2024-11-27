FROM nginx

ENV API_URL=http://localhost:3000

COPY dist /usr/share/nginx/html

RUN rm /etc/nginx/conf.d/default.conf

COPY cicd/nginx/default.conf.template /etc/nginx/templates

CMD envsubst '$API_URL' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'

EXPOSE 80