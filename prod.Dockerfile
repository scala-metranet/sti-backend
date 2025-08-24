FROM node:20

# RUN apk add --no-cache g++ make py3-pip

RUN apt-get update && apt-get install -y g++ make python3 python3-pip \
    && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm

WORKDIR /app

COPY package*.json pnpm-lock.yaml tsconfig.json ./

# pertama sync lockfile
RUN pnpm install --no-frozen-lockfile
# lalu pakai frozen supaya konsisten
# RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

CMD ["pnpm", "start:tsc"]
