# Step 1: Node.js ka image use karna
FROM node:18

# Step 2: Server ke andar folder banana
WORKDIR /app

# Step 3: Package files copy karke modules install karna
COPY package*.json ./
RUN npm install

# Step 4: Baki bacha code copy karna
COPY . .

# Step 5: Batana ki app kis port par chalega
EXPOSE 8999

# Step 6: Bot chalane ka command
CMD ["node", "index.js"]