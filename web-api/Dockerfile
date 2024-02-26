FROM gradle:jdk8 as gradleimage
COPY webapi /webapi
COPY repository.json /webapi/conf/repository.json
COPY griddb_webapi.properties /webapi/conf/griddb_webapi.properties

WORKDIR /webapi/webapi-ce/
RUN ./gradlew build

ENV GS_WEBAPI_HOME=/webapi

WORKDIR /webapi/webapi-ce/build/libs/
ENTRYPOINT ["java","-jar","griddb-webapi-ce-5.5.0.jar"]
