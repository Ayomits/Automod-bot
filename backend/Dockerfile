FROM python:3.12.8

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    runit \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN pip install "poetry==2.1.2" --no-cache-dir

RUN mkdir -p /etc/service/app /runit
COPY ./docker/runit/backend/dev.run /etc/service/app/run
COPY ./docker/runit/backend/dev.sh /runit/dev.sh
RUN chmod +x /etc/service/app/run /runit/dev.sh

CMD ["runsvdir", "/etc/service"]
