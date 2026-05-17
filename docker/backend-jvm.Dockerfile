# Stage 1: Build the Quarkus JVM application
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /code
COPY backend/pom.xml /code/
RUN mvn -B dependency:go-offline
COPY backend/src /code/src
RUN mvn package -DskipTests -Dmaven.test.skip=true

# Stage 2: Run the application
FROM registry.access.redhat.com/ubi9/openjdk-17-runtime:1.24
ENV LANGUAGE='en_US:en'

COPY --from=build /code/target/quarkus-app/lib/ /deployments/lib/
COPY --from=build /code/target/quarkus-app/*.jar /deployments/
COPY --from=build /code/target/quarkus-app/app/ /deployments/app/
COPY --from=build /code/target/quarkus-app/quarkus/ /deployments/quarkus/

EXPOSE 8081
USER 185
ENV JAVA_OPTS_APPEND="-Dquarkus.http.host=0.0.0.0 -Dquarkus.http.port=8081 -Djava.util.logging.manager=org.jboss.logmanager.LogManager"
ENV JAVA_APP_JAR="/deployments/quarkus-run.jar"

ENTRYPOINT [ "/opt/jboss/container/java/run/run-java.sh" ]
