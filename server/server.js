/*
Simple Express server to accept a proof upload (JSON or file), pin to web3.storage, and return CID.
Requires WEB3STORAGE_TOKEN in env.
*/
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const fetch = require('node-fetch');

const upload = multer();
const app = express();
app.use(express.json());

const WEB3TOKEN = process.env.WEB3STORAGE_TOKEN || "";

app.post('/pin', upload.single('file'), async (req, res) => {
  try {
    if (!WEB3TOKEN) return res.status(500).json({ error: 'WEB3STORAGE_TOKEN not set in .env' });
    let body;
    if (req.file) {
      body = req.file.buffer;
    } else if (req.body && req.body.text) {
      body = req.body.text;
    } else {
      return res.status(400).json({ error: 'no file or text provided' });
    }

    // Use web3.storage simple POST to /upload
    const formData = new (require('form-data'))();
    formData.append('file', body, { filename: 'proof.json' });

    const r = await fetch('https://api.web3.storage/upload', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + WEB3TOKEN
      },
      body: formData
    });

    const data = await r.json();
    return res.json({ cid: data.cid, url: 'https://'+data.cid+'.ipfs.dweb.link' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, ()=> console.log('Server listening on', PORT));
