FROM golang:1.24-alpine AS builder

WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/quiet-api ./cmd/api
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/quiet-seed ./cmd/seed

FROM alpine:3.22
RUN addgroup -S quiet && adduser -S -G quiet quiet
WORKDIR /app
COPY --from=builder /out/quiet-api /app/quiet-api
COPY --from=builder /out/quiet-seed /app/quiet-seed
COPY --from=builder /src/migrations /app/migrations
USER quiet
EXPOSE 8080
CMD ["/app/quiet-api"]
