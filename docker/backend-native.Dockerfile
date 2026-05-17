# Stage 1: Build the native image
FROM quay.io/quarkus/ubi-quarkus-mandrel-builder-image:jdk-21 AS build
USER root

# Install Mandrel 25 (JDK 25 + native-image 25) for Quarkus 3.35.3 compatibility
RUN curl -L -o /tmp/mandrel.tar.gz \
    https://github.com/graalvm/mandrel/releases/download/mandrel-25.0.3.0-Final/mandrel-java25-linux-amd64-25.0.3.0-Final.tar.gz && \
    tar -xzf /tmp/mandrel.tar.gz -C /opt && \
    mv /opt/mandrel-java25-25.0.3.0-Final /opt/mandrel && \
    rm /tmp/mandrel.tar.gz

ENV JAVA_HOME=/opt/mandrel
ENV PATH=$JAVA_HOME/bin:$PATH

USER quarkus
WORKDIR /project
COPY --chown=quarkus:quarkus backend/mvnw /project/mvnw
COPY --chown=quarkus:quarkus backend/.mvn /project/.mvn
COPY --chown=quarkus:quarkus backend/pom.xml /project/
RUN ./mvnw -B org.apache.maven.plugins:maven-dependency-plugin:3.1.2:go-offline
COPY --chown=quarkus:quarkus backend/src /project/src
RUN ./mvnw package -Dnative -Dquarkus.native.native-image-xmx=4g -DskipTests -Dmaven.test.skip=true

# Stage 2: Create the runner image
FROM registry.access.redhat.com/ubi9/ubi-minimal:9.3
WORKDIR /work/
COPY --from=build /project/target/*-runner /work/application
RUN chmod 775 /work
EXPOSE 8081

ENV QUARKUS_HTTP_PORT=8081
ENV QUARKUS_HTTP_HOST=0.0.0.0

ENTRYPOINT ["./application"]