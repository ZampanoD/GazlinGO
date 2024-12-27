FROM golang:1.22-alpine AS builder


WORKDIR /app


COPY go.mod go.sum ./
RUN go mod download


COPY . .


RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd/api/main.go


FROM debian:buster-slim


RUN apt-get update && apt-get install -y ca-certificates curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/main .


RUN mkdir -p /app/storage/models && \
    mkdir -p /app/storage/previews && \
    chmod -R 777 /app/storage

EXPOSE 8080

CMD ["./main"]