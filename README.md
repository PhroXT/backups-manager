# Backup Manager

A lightweight web application for managing and automating PostgreSQL database backups; in the future, I'll improve for an others DB engines.

Centralized interface to configure database connections, run backups manually or on a schedule, monitor their execution, and store the resulting files in object storage.

The project is designed to run entirely through Docker.

## Features

* PostgreSQL database backup management
* Manual and scheduled backups
* Backup execution monitoring
* Weekly and monthly retention (space reuse)
* MinIO-based backup storage
* Background job processing with Redis and BullMQ
* Fully Dockerized environment

## Tech Stack

* Frontend: Next.js, React, TypeScript
* Backend: NestJS, TypeScript
* Database: PostgreSQL, Prisma
* Job Queue: BullMQ, Redis
* Storage: MinIO
* Infrastructure: Docker

## Getting Started

### Requirements

* Git
* Docker
* Docker Compose

### Installation

- Clone the repository:
git clone <REPOSITORY_URL>
cd backups-manager

- Create your environment file (main, backend and frontend directory):
cp .env.example .env

- Configure the required environment variables and start the application:
docker compose up -d --build

- To view the application logs:
docker compose logs -f

## Project Status

The project is functional and suitable for use in controlled environments.

It is actively open to future improvements, refinements, and additional features as new requirements arise.
