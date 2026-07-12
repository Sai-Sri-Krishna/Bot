# ==========================================
# Multi-stage Dockerfile for Spring Boot on Render
# ==========================================

# Stage 1: Build
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
# Download dependencies first (cached layer)
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests -q

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/nec-backend-spring-1.0.0.jar app.jar
EXPOSE 8080

# Run with environment variables
ENTRYPOINT ["java", "-jar", "app.jar"]
