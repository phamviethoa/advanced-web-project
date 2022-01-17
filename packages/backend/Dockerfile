FROM node:16.8-alpine3.11 as builder

ENV NODE_ENV build

WORKDIR /home/node

COPY . /home/node

RUN npm ci \
    && npm run build \
    && npm prune --production

# ---

FROM node:16.8-alpine3.11

ENV NODE_ENV production

ENV PORT=5000
ENV DB_HOST=ec2-52-21-252-142.compute-1.amazonaws.com
ENV DB_PORT=5432
ENV DB_USERNAME=fcmkbnqojilyga
ENV DB_PASSWORD=84cc0b2e87e12f33272b0df62614cac987a7fac887544d7f80a5e282d5300783
ENV DB_DATABASE=dc9njiiie2chih
ENV DB_SYNC=true

ENV FRONT_END_URL=https://advanced-web-final-frontend.herokuapp.com
ENV BACK_END_URL=https://advanced-web-final-backend.herokuapp.com

USER node
WORKDIR /home/node

COPY --from=builder /home/node/package*.json /home/node/
COPY --from=builder /home/node/node_modules/ /home/node/node_modules/
COPY --from=builder /home/node/dist/ /home/node/dist/

CMD ["node", "dist/main.js"]
