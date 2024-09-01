FROM nginx

COPY dist /usr/share/nginx/html

RUN rm /etc/nginx/conf.d/default.conf

COPY cicd/nginx/default.conf /etc/nginx/conf.d

EXPOSE 80