FROM jenkins/jenkins:2.568.3

USER root

RUN apt-get update \
    && apt-get install -y docker.io gosu \
    && rm -rf /var/lib/apt/lists/*

COPY docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh

ENTRYPOINT ["/docker-entrypoint.sh"]