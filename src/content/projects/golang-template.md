---
name: Go Template
tagline: A production-ready Go blueprint for rapid project scaffolding.
url: https://github.com/Wiran-Larbi/go-template
year: 2026
started: 2026-01-15
role: Designer & builder
stack: [Go, Docker, PostgreSQL, Makefile]
image: /assets/images/projects/golang-template.jpeg
featured: true
order: 5
status: active
---

## About

Go Template is a highly opinionated Go project template designed to bridge the gap between "Hello World" and a scalable microservice. It eliminates the initial hours of configuration by providing a pre-structured environment that follows hexagonal architecture principles and idiomatic Go patterns.

I built this to standardize how I approach new services, focusing on developer experience (DX) and deployment readiness. It includes pre-configured middleware for logging, recovery, and tracing, alongside a robust environment variable management system. The goal is to let developers focus on business logic while the boilerplate—like database migrations and health checks—is already solved.

## Tools & process

- **Go (1.24+)** — Leveraging standard library strengths with minimal external dependencies to ensure long-term maintainability.
- **Automation** — Integrated Makefile for common tasks like linting, testing, and generating SQLc or Wire dependencies.
- **Containerization** — Optimized multi-stage Dockerfiles that result in tiny, secure production binaries (distroless).