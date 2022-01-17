FROM node:14-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json .

RUN npm install

ARG api_gateway=https://advanced-web-final-backend.herokuapp.com
ENV NEXT_PUBLIC_API_GATEWAY $api_gateway

ARG fe_uri=https://advanced-web-final-frontend.herokuapp.com
ENV NEXTAUTH_URL $fe_uri

COPY . .
RUN npm install -g typescript
RUN npm run build

FROM node:alpine AS runner
WORKDIR /app

ENV NODE_ENV production

ENV PORT 3000

ENV NEXT_TELEMETRY_DISABLED 1
ENV NEXT_PUBLIC_API_GATEWAY $api_gateway

ENV SECRET fjsdfkjasdhfkjasfdfdfwrwejhgbb2323ref
ENV NEXTAUTH_URL $fe_uri

ENV FACEBOOK_ID 7055805884436981
ENV FACEBOOK_SECRET 575bc3e5520f202b8b8263ace6365b53

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs

EXPOSE 3000

CMD ["npm", "start"]


