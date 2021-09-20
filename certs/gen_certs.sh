#!/bin/sh

BASE=$(pwd)/certs
CNF_DIR=$BASE/conf.d
GEN_DIR=$BASE/gen
[ ! -d $CNF_DIR ] && { echo "$CNF_DIR config directory not found, exit."; exit 1; }
[ ! -d $GEN_DIR ] && { echo "$GEN_DIR output directory not found, exit."; exit 1; }
rm -rf $GEN_DIR/*

CERT_DAYS=3650
CA_CNF=$CNF_DIR/root.cnf
CA_KEY=$GEN_DIR/root.key
CA_CRT=$GEN_DIR/root-ca.pem

GEN_CA (){
    # root CA
    openssl genrsa -out $CA_KEY 4096
    openssl req -x509 -new -days $CERT_DAYS -key $CA_KEY -out $CA_CRT -config $CA_CNF
}

GEN_CERTS () {
    for cnf in $CNF_DIR/*
    do
        if [ -f $cnf ] && [ `basename $cnf` != "root.cnf" ]; then
            NAME=$(basename $cnf .cnf)
            CNF=$cnf
            KEY=$GEN_DIR/$NAME.key
            CSR=$GEN_DIR/$NAME.csr
            CRT=$GEN_DIR/$NAME.pem
            PKCS8=$GEN_DIR/$NAME-key.pem
            openssl genrsa -out $KEY 4096
            openssl req -new -key $KEY -out $CSR -config $CNF
            openssl x509 -req -in $CSR -out $CRT -CA $CA_CRT -CAkey $CA_KEY -CAcreateserial -days $CERT_DAYS -extfile $CNF -extensions v3_req
            openssl pkcs8 -topk8 -inform PEM -in $KEY -outform PEM -nocrypt -v1 PBE-SHA1-3DES -out $PKCS8
        fi
    done
}

GEN_CA
GEN_CERTS

# cert files permission
chmod -R 600 $GEN_DIR/*
chown -R 1000:1000 $GEN_DIR/*
