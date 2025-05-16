FROM node:18-alpine

# Set working directory
WORKDIR /ourdev-backend

# Install only dependencies first
COPY package*.json prisma/*.prisma ./
RUN npm install

# Generate Prisma Client inside the container
RUN npx prisma generate

# Now copy the rest
COPY . .

# Open port
EXPOSE 3001

# Start app
CMD ["npm", "run", "start:dev"]
