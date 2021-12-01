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

ENV FRONT_END_URL=http://localhost:3000

ENV PORT=5000
ENV DB_HOST=ec2-3-211-228-251.compute-1.amazonaws.com
ENV DB_PORT=5432
ENV DB_USERNAME=wkywguaffmugcr
ENV DB_PASSWORD=274436b80133ba86b1fb89147ac164e638a9137134c51f24621683b75e534eae
ENV DB_DATABASE=dda61b294b74ke
ENV DB_SYNC=true

USER node
WORKDIR /home/node

COPY --from=builder /home/node/package*.json /home/node/
COPY --from=builder /home/node/node_modules/ /home/node/node_modules/
COPY --from=builder /home/node/dist/ /home/node/dist/

CMD ["node", "dist/main.js"]
