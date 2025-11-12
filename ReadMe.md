# Product & SKU Management System (Node.js + MongoDB)

A lightweight, production-style **Product & SKU Management System** built with **Node.js**, **Express**, and **MongoDB**.  
It supports product and SKU (stock) management with validation, pagination, analytics, and role-based access.



# 🚀 Features

 Create and update Products  
 Manage multiple SKUs  
  
- Cannot activate a SKU if parent product is inactive  
 Pagination, filtering & sorting  
 Role-based access (admin, manager)  
Analytics endpoint  
Clean validation and error handling  



##  Tech Stack



| Backend | Node.js, Express |
| Database | MongoDB (Mongoose ODM) |
| Validation | express-validator |
| Auth | Simple role-based middleware (mocked user) |
| Environment | dotenv |

---

# Setup Instructions

# Clone the repository

git clone https://github.com/arsj600/stock-keep-unit-management.git



#  Install dependencies
npm install

MONGODB_URL="mongodb+srv://127.0.0.1:27017/"

PORT=4000

## PostMan

Create Product : http://localhost:4000/products  
{"
    "name": "iPhone 16",
  "description": "Latest Apple smartphone",
  "categories": ["Electronics", "Mobile"],
  "price": 99999,
  "isActive": true
  "}

 Create Stock : http://localhost:4000/stock

 {
  "productId": "6914d788ac3919d5ae81c5dc",
  "code": "IP16-BLACK-128",
  "stock": 20,
  "price": 99999,
  "isActive": true,
  "attributes": {
    "color": "Black",
    "storage": "128GB"
  }
}

List Products :http://localhost:4000/products?page=1&limit=10 
{
  "total": 1,
  "page": 1
  }

  List Stocks:http://localhost:4000/stock?productId=6914d788ac3919d5ae81c5dc
   

   Analytics:http://localhost:4000/stock/analytics

<img width="1593" height="842" alt="Screenshot 2025-11-12 224829" src="https://github.com/user-attachments/assets/5dc2656a-da1a-4e0d-bec7-fd6802093146" />


