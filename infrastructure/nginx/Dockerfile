FROM nginx:latest as prod

COPY --from=infrastructure-frontend front/out /usr/share/nginx/html
COPY nginx.template.conf /etc/nginx/nginx.template.conf
COPY ./snippets /etc/nginx/snippets

EXPOSE 80/tcp

CMD ["/bin/sh", "-c", "envsubst '${API_HOST}' < /etc/nginx/nginx.template.conf > /etc/nginx/nginx.conf && nginx -g 'daemon off;'"]