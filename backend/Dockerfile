FROM python:3.12.8-slim

WORKDIR /app

COPY ./backend/requirements.txt /app/requirements.txt

RUN pip install -r requirements.txt

COPY ./backend /app/

CMD ["python3", "src/main.py"]
