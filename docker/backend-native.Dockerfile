# Stage 1: Build the native image
FROM quay.io/quarkus/ubi-quarkus-mandrel-builder-image:23.0-java17 AS build
USER quarkus
WORKDIR /code
COPY --chown=quarkus:quarkus backend/mvnw /code/mvnw
COPY --chown=quarkus:quarkus backend/.mvn /code/.mvn
COPY --chown=quarkus:quarkus backend/pom.xml /code/
RUN ./mvnw -B org.apache.maven.plugins:maven-dependency-plugin:3.1.2:go-offline
COPY --chown=quarkus:quarkus backend/src /code/src
RUN ./mvnw package -Dnative -Dquarkus.native.native-image-xmx=4g -DskipTests -Dmaven.test.skip=true

# Stage 2: Create the runner image
FROM registry.access.redhat.com/ubi9/ubi-minimal:9.3
WORKDIR /work/
COPY --from=build /code/target/*-runner /work/application
RUN chmod 775 /work
EXPOSE 8081

# Set the port to 8081 to match the Nginx proxy
ENV QUARKUS_HTTP_PORT=8081
ENV QUARKUS_HTTP_HOST=0.0.0.0

ENTRYPOINT ["./application"]
