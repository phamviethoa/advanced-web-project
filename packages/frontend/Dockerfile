FROM node:12

ENV PORT 3000

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Installing dependencies
COPY package*.json /usr/src/app/
RUN npm install

# Copying source files
COPY . /usr/src/app

# Building app
RUN npm run build
EXPOSE 3000

ENV PORT 3000
ENV SECRET=fjsdfkjasdhfkjasfdfdfwrwejhgbb2322ref
ENV NEXTAUTH_URL=http://localhost:3000

ENV NEXT_PUBLIC_API_GATEWAY=https://advanced-web-api.herokuapp.com

ENV FACEBOOK_ID=7055805884436981
ENV FACEBOOK_SECRET=575bc3e5520f202b8b8263ace6365b53
ENV GOOGLE_ID=589914439391-shubv5lgav86a18rd8nc8b0ephqm1n15.apps.googleusercontent.com
ENV GOOGLE_SECRET=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

# Running the app
CMD "npm" "run" "dev"

