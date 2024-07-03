FROM alpine:3.20.1

RUN apk add --no-cache \
  wget \
  openjdk11 \
  build-base \
  python3 \
  py3-pip \  
  python3-dev \
  zip \
  py3-virtualenv \
  maven

ENV ENV_DIR /app/python/venv

WORKDIR /app/python
RUN python3.12 -m venv ${ENV_DIR}
RUN source ${ENV_DIR}/bin/activate 
RUN ${ENV_DIR}/bin/pip3.12 install \
  pandas \
  numpy \
  scikit-learn 

COPY inference.py /app/python/inference.py

#CMD ["/app/venv/bin/python3.12", "griddb.py"]

WORKDIR /app/java

COPY pom.xml ./

COPY src ./src
# COPY tests ./tests
#COPY conf ./conf

RUN mvn install
RUN touch log-half-second.txt

# ENTRYPOINT ["tail"]
# CMD ["-f","/dev/null"]
CMD ["java", "-jar", "target/Processor.jar"]
