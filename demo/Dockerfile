
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
 
COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests
 
FROM eclipse-temurin:17-jre
WORKDIR /app

RUN useradd --system --user-group appuser
USER appuser


COPY --from=build --chown=appuser:appuser /app/target/*.jar app.jar

EXPOSE 8000

ENTRYPOINT ["java", "-Djava.net.preferIPv4Stack=true", "-Djava.net.preferIPv4Addresses=true", "-jar", "app.jar"]
