FROM nginx:latest as prod

COPY --from=infrastructure-frontend front/out /usr/share/nginx/html
COPY nginx.local.template.conf /etc/nginx/nginx.local.template.conf
COPY nginx.production.template.conf /etc/nginx/nginx.production.template.conf
COPY ./snippets /etc/nginx/snippets

EXPOSE 80/tcp

CMD ["/bin/sh", "-c", "envsubst '${API_HOST} ${TAILSCALE_HOSTNAME}' < /etc/nginx/nginx.${ENVIRONMENT}.template.conf > /etc/nginx/nginx.conf && nginx -g 'daemon off;'"]