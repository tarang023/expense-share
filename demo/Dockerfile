# Stage 1: Build the application using a standard Ubuntu-based container
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy the pom.xml and source code
COPY pom.xml .
COPY src ./src

# Compile and package the application (skipping tests for speed)
RUN mvn clean package -DskipTests

# Stage 2: Run the application using a standard runtime image
FROM eclipse-temurin:17-jre
WORKDIR /app

# Copy the generated JAR file from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port 8000 for Spring Boot
EXPOSE 8000

# Run the application
ENTRYPOINT ["java", "-Djava.net.preferIPv4Stack=true", "-Djava.net.preferIPv4Addresses=true", "-jar", "app.jar"]