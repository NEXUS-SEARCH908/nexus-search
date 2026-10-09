# Multi-stage zero-overhead construction template targeting optimized free tier deployments
FROM node:18-alpine AS dependency-layer
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:18-alpine AS builder-layer
WORKDIR /app
COPY --from=dependency-layer /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npx prisma generate
RUN npm run build

FROM node:18-alpine AS production-runner-layer
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs-group
RUN adduser --system --uid 1001 nextjs-user

COPY --from=builder-layer /app/public ./public
COPY --from=builder-layer --chown=nextjs-user:nodejs-group /app/.next ./.next
COPY --from=builder-layer /app/node_modules ./node_modules
COPY --from=builder-layer /app/package.json ./package.json
COPY --from=builder-layer /app/prisma ./prisma

USER nextjs-user
EXPOSE 3000
ENV PORT=3000

CMD ["npx", "prisma", "db", "push", "&&", "npm", "start"]
