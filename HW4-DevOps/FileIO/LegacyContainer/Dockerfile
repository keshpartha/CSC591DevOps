FROM ubuntu:14.04

RUN apt-get -y update
RUN apt-get -y install socat

RUN echo 'Legacy file to show linking' > legacy.txt

CMD socat TCP4-LISTEN:9001 SYSTEM:'cat legacy.txt'