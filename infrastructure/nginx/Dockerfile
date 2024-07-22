FROM nginx:latest as prod

COPY --from=infrastructure-frontend front/out /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
COPY ./snippets /etc/nginx/snippets

EXPOSE 80/tcp

CMD ["/usr/sbin/nginx", "-g", "daemon off;"]