# AgroMind AI

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&height=220&color=0:0f172a,100:16a34a&text=AgroMind%20AI&fontColor=ffffff&fontSize=52&animation=fadeIn" />
</p>

<p align="center">
  Plataforma de monitoramento agrícola, diagnóstico agronômico e análise climática construída com ASP.NET Core, PostgreSQL, React e Machine Learning.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/.NET-10.0-512BD4?style=for-the-badge" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge" />
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge" />
</p>

---

## Overview

AgroMind AI é uma plataforma SaaS voltada para monitoramento agrícola, diagnóstico inteligente e previsão de produtividade.

O sistema utiliza dados climáticos, características do solo e informações das culturas para gerar análises e alertas que auxiliam na tomada de decisão.

---

## Features

### Authentication

* JWT Authentication
* Refresh Token Rotation
* Role Based Access Control
* Rate Limiting
* Audit Logs

### Farm Management

* Farm Registration
* Field Management
* Crop Management
* Historical Tracking

### Climate Monitoring

* OpenMeteo Integration
* Automated Weather Updates
* Climate Cache Layer
* Risk Analysis

### Agronomic Engine

* Internal Rule Engine
* Risk Scoring
* Soil Analysis
* Irrigation Recommendations

### Observability

* Serilog
* OpenTelemetry
* Health Checks
* Structured Logging

### Artificial Intelligence

* Agricultural Assistant
* Productivity Forecasting
* Machine Learning Models
* Intelligent Recommendations

---

## Architecture

```text
React + Vite
      │
      ▼

ASP.NET Core API
      │
      ├── CQRS
      ├── MediatR
      ├── Hangfire
      ├── Memory Cache
      ├── Audit Logs
      ├── Health Checks
      └── Agronomic Engine
      │
      ▼

PostgreSQL
      │
      ▼

FastAPI
      │
      ▼

Machine Learning
```

---

## Main Flow

```text
Scheduler
    │
    ▼

OpenMeteo API
    │
    ▼

Memory Cache
    │
    ▼

Agronomic Engine
    │
    ▼

Risk Score
    │
    ▼

Diagnosis
    │
    ▼

Alert Generation
    │
    ▼

Email Notification
    │
    ▼

Dashboard
```

---

## Project Structure

```text
agromind-ai/

backend/
 ├── AgroMind.API
 ├── AgroMind.Application
 ├── AgroMind.Domain
 └── AgroMind.Infrastructure

frontend/

ia-service/

database/

docs/
```

---

## Technologies

### Backend

* ASP.NET Core 9
* Entity Framework Core
* PostgreSQL
* MediatR
* FluentValidation
* Hangfire
* Serilog
* OpenTelemetry

### Frontend

* React
* Vite
* Tailwind CSS
* Recharts
* Leaflet

### AI

* FastAPI
* Scikit-Learn
* Claude API

### Testing

* xUnit
* FluentAssertions
* Testcontainers

---

## Security

* JWT Authentication
* Refresh Token Rotation
* BCrypt Password Hashing
* Native .NET Rate Limiting
* Audit Logging
* HTTPS Enforcement
* Environment Variables
* Secure Internal API Communication

---

## Health Checks

```http
GET /api/health
```

Monitored Services:

* PostgreSQL
* OpenMeteo
* FastAPI

---

## Running Locally

```bash
git clone https://github.com/alessandro-a11y/agromind-ai.git

cd agromind-ai

docker compose up -d

dotnet build

dotnet test

dotnet run
```

---

## Roadmap

### Sprint 1

* Authentication
* Users
* Farms
* Fields

### Sprint 2

* Climate Integration
* Dashboard
* Cache Layer

### Sprint 3

* Hangfire
* Alerts
* Notifications

### Sprint 4

* Agronomic Engine
* Reports
* Observability

### Sprint 5

* Frontend
* Deployment

### Sprint 6

* AI Assistant
* Machine Learning
* Productivity Forecasting

---

## License

MIT License
