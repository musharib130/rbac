require('dotenv').config();

const express = require("express");
const morgan = require('morgan');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Parse JSON bodies
app.use(morgan('dev')); // Logging

const port = process.env.PORT || 3000;

app.use(express.static(__dirname + "/public/"));

app.get("/", (req, res) =>
  res.send("/opt/bitnami/apps/myapp/public/index.html")
);

app.use('/auth', require('./routes/auth.routes'))

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong!' });
});


app.listen(port, () =>
  console.log(`App running on: http://localhost:${port}`)
);