const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const cors= require('cors');
const cookieParser = require('cookie-parser');


const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.json());



const PORT =process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});