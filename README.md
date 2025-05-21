# 🛠️ Postman to Karate Converter

This Node.js-based tool automatically converts a Postman collection (v2.1+) into Karate test scripts. It helps QA and automation engineers streamline the migration process from Postman API tests to Karate test automation by generating clean, maintainable `.feature` files.

---

## 🚀 Features

- 🔁 Converts all Postman requests into Karate `.feature` files.
- 🧼 Clean and readable output with:
  - Readable headers using `And header` format
  - Reusable request bodies via `* def` with external JSON files
- 📁 Organizes all output in a dedicated `karate-features` directory
- 🔧 Minimal configuration needed

---

## 📦 Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/postman-to-karate.git
cd postman-to-karate
```

### 2. Install dependencies

```bash
npm install
```

## 🧪 Usage

### Step 1: Prepare your Postman collection
Export your Postman collection as postman-collection.json and place it in the root of the project (or update the path in the script).

### Step 2: Run the converter
```bash
node convert.js
```
This will generate all Karate .feature files under the karate-features/ directory.

## 🔍 Example Output
A sample Postman request like:
```bash
{
  "method": "POST",
  "header": [
    { "key": "Authorization", "value": "Bearer token123" }
  ],
  "body": {
    "mode": "raw",
    "raw": "{\"name\":\"John\"}"
  },
  "url": { "raw": "http://localhost:8080/api/users" }
}
```

...will generate a .feature file like:

```bash
Feature: Create User

Scenario: Create User
  Given url 'http://localhost:8080/api/users'
  And header Authorization = 'Bearer token123'
  * def requestBody = read('requestBodies/create-user.json')
  And request requestBody
  When method post
  Then status 200
```

## 📁 Project Structure
```bash
postman-to-karate/
├── convert.js
├── postman-collection.json
├── karate-features/
│   └── create-user.feature
├── requestBodies/
│   └── create-user.json
├── .gitignore
└── README.md
```

## 📜 License
MIT License – feel free to use and modify this project.

## ✨ Author
Built with ❤️ by  [[Fathir Wafda]](https://github.com/fathirwafda)
