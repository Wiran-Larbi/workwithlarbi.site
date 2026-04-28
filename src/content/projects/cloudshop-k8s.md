---
name: CloudShop K8s
tagline: Microservices-based e-commerce orchestration with Kubernetes.
url: https://github.com/Wiran-Larbi/k8s-microservices-demo
year: 2026
started: 2025-03-01
role: DevOps & Cloud Engineer
stack: [Kubernetes, Docker, Redis, Microservices]
image: /assets/images/projects/k8s-architecture.png
featured: true
order: 7
status: active
---

## About

CloudShop is a cloud-native deployment of a complex e-commerce ecosystem, specifically engineered to showcase the power of Kubernetes orchestration. The project transitions a monolithic online store into a highly resilient microservices architecture, where critical components like Payment, Cart, and Shipping services operate as independent, self-healing units.

The deployment leverages Kubernetes service discovery for internal communication and implements a Redis caching layer to optimize session management and data retrieval speeds. By utilizing specialized manifests for each service, the system achieves automatic scaling and high availability, ensuring that the frontend remains accessible even during high-traffic surges or localized service failures.

## Tools & process

- **Orchestration** — Managed via Kubernetes clusters, using Deployments for state management and Services for internal/external networking.
- **Containerization** — Each of the 10+ services is containerized with Docker, ensuring environment parity across development and production.
- **Service Mesh Logic** — Configured NodePort exposing for the frontend and ClusterIP for internal service-to-service communication across ports like 50051 (gRPC) and 6379 (Redis).
- **Automation** — Streamlined deployment using a unified `kubectl` application strategy for rapid cluster bootstrapping.