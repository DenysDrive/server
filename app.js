const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const port = 57002;

app.get('/api/test', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
})
