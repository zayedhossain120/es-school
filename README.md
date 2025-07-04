<p align="center"> <a href="https://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a> </p> <p align="center">A beginner-friendly school management system built with <a href="http://nestjs.com" target="_blank">NestJS</a>, <strong>Prisma</strong>, <strong>MySQL</strong>, and <strong>Cloudflare R2</strong>.</p> <p align="center"> <a href="https://www.npmjs.com/package/cloudflare-r2-kit" target="_blank"><img src="https://img.shields.io/npm/v/cloudflare-r2-kit.svg" alt="NPM Version" /></a> <a href="#" target="_blank"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="Package License" /></a> <a href="#" target="_blank"><img src="https://img.shields.io/github/stars/your-username/es-school?style=social" alt="GitHub Stars" /></a> <a href="https://twitter.com/zayedcodes" target="_blank"><img src="https://img.shields.io/twitter/follow/zayedcodes.svg?style=social&label=Follow" alt="Follow on Twitter"></a> </p>
📚 Description
ES-School is a demo school management system designed to help beginners get hands-on experience with NestJS, Prisma ORM, and modern backend development practices.

It includes user roles (student, teacher, admin), image uploads via Cloudflare R2, and modular REST APIs with secure role-based authentication.

🧠 Tech Stack
⚙️ NestJS – Modular backend framework

🧱 Prisma – Type-safe ORM for MySQL

🔐 JWT – Role-based authentication

☁️ Cloudflare R2 – File upload with signed URLs

🧪 TypeScript – Safe & structured development

🧩 Features
Role-based access (Student, Teacher, Admin)

Modular architecture with DTOs, guards, and decorators

Cloudflare R2 file uploads (profile photos, course thumbnails)

Real-world relational database design

Pagination, filtering, and search utilities

RESTful API structure

📁 Modules
👤 User

📚 Course

📝 Exam

🎓 Enrollment

📊 Result

🛠️ Project Setup
bash
Copy
Edit
$ npm install
📦 Environment Variables
Create a .env file and add:

env
Copy
Edit
DATABASE_URL="mysql://user:password@localhost:3306/es_school"
JWT_SECRET="your-secret-key"
R2_BUCKET="your-r2-bucket"
R2_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
R2_ACCESS_KEY_ID="your-access-key"
R2_SECRET_ACCESS_KEY="your-secret-access-key"
▶️ Run Project
bash
Copy
Edit

# development

$ npm run start

# watch mode

$ npm run start:dev

# production

$ npm run start:prod
✅ Run Tests
bash
Copy
Edit

# unit tests

$ npm run test

# e2e tests

$ npm run test:e2e

# test coverage

$ npm run test:cov
#   c r m  
 