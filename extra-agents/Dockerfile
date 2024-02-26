FROM griddbnet/java-log-course-agent:latest

WORKDIR /app

COPY tests ./tests
COPY conf ./conf

COPY entrypoint.sh /entrypoint.sh
RUN chmod 755 /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
CMD ["java", "-jar", "target/Agent.jar"]

