---
name: SecureApp — Medical Records Portal
tagline: A highly secure, robust, and observable medical records portal deployed on Google Kubernetes Engine (GKE) Autopilot.
url: https://github.com/Wiran-Larbi/secure-medical-app
year: 2026
started: 2026-05-01
role: DevSecOps Engineer
stack: [Kubernetes, GKE, Spring Boot, React, GitLab CI, Prometheus]
image: /assets/images/projects/secure-medical/1.png
featured: true
order: 10
status: active
---

A highly secure, robust, and observable medical records portal deployed on **Google Kubernetes Engine (GKE) Autopilot**. This project demonstrates end-to-end DevSecOps practices, from code commit to production deployment.

## 🌟 Key Features

- **Frontend**: React Single Page Application (SPA) served via Nginx.
- **Backend**: Spring Boot (Java 21) REST API.
- **Data Tier**: MySQL (Persistent StatefulSet) and Redis (Caching & Sessions).
- **Authentication**: OAuth2 Integration (GitHub, Google), JWT, and MFA.
- **Security First**: Comprehensive CI/CD security scanning, network isolation, and GCP Secret Manager integration.
- **Deep Observability**: Fully integrated `kube-prometheus-stack` (Prometheus & Grafana) via Spring Boot Micrometer.

---

## 🏗️ Architecture

![SecureApp Architecture](/assets/images/projects/secure-medical/latest_diagram.drawio.png)

The application runs across two namespaces in GKE Autopilot:
- **`secureapp`**: Houses the application components, ConfigMaps, and Secrets.
- **`monitoring`**: Houses the Prometheus Operator, Grafana, and Alertmanager.

Traffic is routed via a **GCE L7 Load Balancer** managed by a Kubernetes Ingress, ensuring HTTPS termination and path-based routing (`/` for Frontend, `/api/*` for Backend).

### Component Topology

* **Frontend**: 2 Replicas (Stateless)
* **Backend**: 2 Replicas (Stateless)
* **MySQL**: 1 Replica (StatefulSet with 10Gi PVC)
* **Redis**: 1 Replica (StatefulSet with 2Gi PVC)

---

## 🛡️ DevSecOps Pipeline

The project utilizes a robust CI/CD pipeline (GitLab CI & Cloud Build) with 6 distinct stages:

1. **Test**: Unit testing with real MySQL/Redis services via Testcontainers.
2. **Code Security**: 
   - **SonarCloud** & **Semgrep** (OWASP Top 10, JWT, React rules).
   - **GitLab SAST** & Secret Detection.
3. **Dependency Scanning**: OWASP Dependency Check (fails on CVSS ≥ 7) and CycloneDX SBOM generation.
4. **Build**: Parallel Docker builds pushed to Artifact Registry / GitLab Container Registry.
5. **Container Scan**: **Hadolint** for Dockerfile linting and **Trivy** for CVE scanning (High/Critical).
6. **Deploy**: Manual deployment gate to GKE Autopilot.

---

## 📊 Observability & Monitoring

The cluster features a fully automated monitoring pipeline bridging the application and monitoring namespaces via a Kubernetes `ServiceMonitor`.

- **Metrics Exposure**: Spring Boot Actuator exposes JVM, HTTP, HikariCP, and Redis metrics at `/actuator/prometheus`.
- **Prometheus Operator**: Automatically discovers the `backend-monitor` ServiceMonitor.
- **Grafana**: Pre-configured dashboards query the Prometheus Server to visualize application and cluster health.

To run the automated monitoring health check:
```bash
bash check-monitoring-health.sh
```

To access Grafana locally (Login: `admin` / `admin`):
```bash
kubectl port-forward -n monitoring svc/prometheus-grafana 3000:80
```

---

## 📸 Application Screenshots

![Dashboard](/assets/images/projects/secure-medical/1.png)
![Login](/assets/images/projects/secure-medical/4.png)
![Records](/assets/images/projects/secure-medical/6.png)
![Metrics](/assets/images/projects/secure-medical/9.png)
![Grafana](/assets/images/projects/secure-medical/10.png)
![Alerts](/assets/images/projects/secure-medical/11.png)

---

## 🚀 Getting Started

### Local Development

You can run the entire stack locally using Docker Compose:

```bash
# Start MySQL, Redis, Backend, and Frontend
docker-compose up -d

# Check service logs
docker-compose logs -f
```

### Deploying to GKE Autopilot

The project includes an automated deployment script for shell-based provisioning:

```bash
# Make the script executable
chmod +x deploy-from-shell.sh

# Run the deployment
./deploy-from-shell.sh
```

**Deployment Script Highlights:**
- Installs the NGINX Ingress Controller (or uses GCE Ingress).
- Deploys the application manifests (`k8s/`).
- Provisions the complete `kube-prometheus-stack` with specific overrides for GKE Autopilot compatibility (e.g., disabling control plane components like `kubeScheduler` and `kubeEtcd`).
- Verifies rollout statuses for all deployments and statefulsets.

---

## 📂 Project Structure

```text
.
├── backend/                  # Spring Boot Java 21 Application
├── frontend/                 # React SPA & Nginx configuration
├── k8s/                      # Kubernetes Manifests
│   ├── backend/              # Deployment, Service, ConfigMap, ServiceMonitor
│   ├── frontend/             # Deployment, Service, ConfigMap
│   ├── mysql/                # StatefulSet, Headless Service
│   └── redis/                # StatefulSet, Headless Service
├── .gitlab-ci.yml            # GitLab DevSecOps Pipeline
├── cloudbuild.yaml           # Google Cloud Build Pipeline
├── docker-compose.yml        # Local Development Stack
├── deploy-from-shell.sh      # Automated GKE Deployment Script
└── check-monitoring-health.sh# Monitoring validation toolkit
```
