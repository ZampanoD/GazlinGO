FROM postgres:15

ENV POSTGRES_DB=minerals
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=404118

COPY init.sql /docker-entrypoint-initdb.d/
RUN echo "\\c minerals;" > /docker-entrypoint-initdb.d/00-init.sql && \
    cat /docker-entrypoint-initdb.d/init.sql >> /docker-entrypoint-initdb.d/00-init.sql && \
    mv /docker-entrypoint-initdb.d/00-init.sql /docker-entrypoint-initdb.d/init.sql

EXPOSE 5432