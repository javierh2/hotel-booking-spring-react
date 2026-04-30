# ── Etapa 1: BUILD ────────────────────────────────────────────────────────
# usamos la imagen oficial de Maven con Java 21 para compilar
# "builder" es el nombre que le damos a esta etapa — lo referenciamos abajo
FROM maven:3.9.6-eclipse-temurin-21 AS builder

# directorio de trabajo dentro del container
WORKDIR /app

# copiamos primero solo el pom.xml y descargamos las dependencias
# esto aprovecha el cache de Docker: si el pom.xml no cambió,
# no vuelve a bajar todas las dependencias en cada build
COPY pom.xml .
RUN mvn dependency:go-offline -B

# ahora copiamos el código fuente y compilamos
COPY src ./src
RUN mvn package -DskipTests

# ── Etapa 2: RUN ──────────────────────────────────────────────────────────
# imagen más liviana solo para correr el JAR — sin Maven ni código fuente
# esto reduce el tamaño final de la imagen de ~600MB a ~200MB
FROM eclipse-temurin:21-jre

WORKDIR /app

# copiamos solo el JAR generado en la etapa anterior
COPY --from=builder /app/target/roomhotel-0.0.1-SNAPSHOT.jar app.jar

# puerto que expone el container — debe coincidir con server.port en properties
EXPOSE 8080

# comando que Render ejecuta para arrancar la app
ENTRYPOINT ["java", "-jar", "app.jar"]