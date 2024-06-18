FROM maven

WORKDIR /app

COPY pom.xml ./

COPY src ./src
COPY tests ./tests
COPY conf ./conf
COPY data ./data

RUN mvn clean
RUN mvn package

COPY entrypoint.sh /entrypoint.sh
RUN chmod 755 /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
CMD ["java", "-jar", "target/Agent.jar"]