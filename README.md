# csv-to-mongo-tool

Quickly import a csv file to a MongoDB database.

Requirements:

- Node.js v10.x.x
- npm
- mongodb

## Example Usage

```bash
cd path/to/csv-to-mongo-tool
npm install
MONGO_URI=mongodb://localhost/petdb CSV_FILE=mypets.csv MODEL_NAME=Pets node import.js
```
