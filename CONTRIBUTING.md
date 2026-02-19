# Contributing to Travel & Pilgrimage Backend

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the project.

## 🚀 Getting Started

1. **Fork the repository**
2. **Clone your fork**
   ```bash
   git clone https://github.com/your-username/flight.git
   cd flight
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. **Set up database**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

6. **Start development server**
   ```bash
   npm run dev
   ```

## 📝 Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow existing code patterns and structure
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

### Project Structure

- **Modules**: Each feature should be in its own module under `src/modules/`
- **Structure**: Each module should have:
  - `controller.ts` - Request handlers
  - `service.ts` - Business logic
  - `repository.ts` - Database operations
  - `routes.ts` - Route definitions
  - `dto.ts` - Data transfer objects

### Database Changes

1. **Update Prisma schema** in `prisma/schemas/`
2. **Create migration**
   ```bash
   npm run prisma:migrate
   ```
3. **Update types**
   ```bash
   npm run prisma:generate
   ```

### API Design

- Follow RESTful conventions
- Use appropriate HTTP methods (GET, POST, PATCH, DELETE)
- Return consistent response format:
  ```json
  {
    "success": true,
    "data": { ... }
  }
  ```
- Include proper error handling and validation
- Document endpoints in Postman collection

### Testing

- Test your changes locally
- Ensure all existing tests pass
- Add tests for new features when possible
- Test edge cases and error scenarios

## 🔀 Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clean, maintainable code
   - Follow the project structure
   - Add comments where needed

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

   Use conventional commit messages:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation changes
   - `style:` - Code style changes (formatting, etc.)
   - `refactor:` - Code refactoring
   - `test:` - Adding tests
   - `chore:` - Maintenance tasks

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**
   - Provide a clear description of changes
   - Reference any related issues
   - Include screenshots if UI changes
   - Ensure CI checks pass

## ✅ Checklist

Before submitting a PR, ensure:

- [ ] Code follows project style guidelines
- [ ] All tests pass
- [ ] Database migrations are included (if schema changed)
- [ ] Environment variables are documented (if new ones added)
- [ ] API endpoints are documented in Postman collection
- [ ] Error handling is implemented
- [ ] Input validation is added
- [ ] No console.log statements in production code
- [ ] Code is properly commented
- [ ] README is updated if needed

## 🐛 Reporting Issues

When reporting issues, please include:

- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Node version, OS, etc.)
- Error messages or logs
- Screenshots if applicable

## 📚 Resources

- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [REST API Best Practices](https://restfulapi.net/)

## 🤝 Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

Thank you for contributing! 🎉
