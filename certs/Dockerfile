ARG ALPINE_VER=3.12
FROM $ALPINE_VER

RUN apk update && \
    apk add --no-cache openssl
WORKDIR /opt
COPY gen_certs.sh gen_certs.sh 
ENTRYPOINT ["/opt/gen_certs.sh"]
