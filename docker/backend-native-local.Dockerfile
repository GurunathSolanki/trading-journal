FROM registry.access.redhat.com/ubi9/ubi-minimal:9.3
WORKDIR /work/
# Copy the pre-compiled native runner from host target directory
COPY backend/target/*-runner /work/application
RUN chmod 775 /work
EXPOSE 8081

ENV QUARKUS_HTTP_PORT=8081
ENV QUARKUS_HTTP_HOST=0.0.0.0

ENTRYPOINT ["./application"]
