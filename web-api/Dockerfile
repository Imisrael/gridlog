FROM gradle:jdk11 as gradleimage
COPY webapi /webapi
COPY repository.json conf/repository.json

WORKDIR /webapi/webapi-ce/
RUN ./gradlew build

ENV GS_WEBAPI_HOME=/webapi

WORKDIR /webapi/webapi-ce/build/libs/
ENTRYPOINT ["java","-jar","griddb-webapi-ce-2.2.0.jar"]

