const express = require('express');
const cloudinary = require('cloudinary').v2;
const bodyParser = require('body-parser');
const multer = require('multer');
const mongoose = require('mongoose');
const cors  = require('cors')

const app = express();

// Configure Cloudinary with your credentials

cloudinary.config({
    cloud_name: 'dkcyf7lcy',
    api_key: '152672242492986',
    api_secret: '30PX0jmxQl2HoYnNsX6CR63p4Jk',
    secure: true,
  });

// Connect to MongoDB (replace 'your_database_url' with your MongoDB URL)
mongoose.connect('mongodb://127.0.0.1:27017/photos', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
}).then(()=>{
    console.log('Connected to MongoDB');
}).catch(()=>{
    console.log('not Connected ');  
})

// Define a schema for storing image data
const imageSchema = new mongoose.Schema({
    imageUrl: String,
});

const Image = mongoose.model('Image', imageSchema);

// Middleware for parsing JSON and form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())

// Configure Multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Define the upload route
app.post('/upload', upload.single('image'), async (req, res) => {
  // Check if an image was uploaded
  if (!req.file) {
    return res.status(400).json({ message: 'No image file provided' });
  }

  // Upload the image to Cloudinary
  cloudinary.uploader.upload_stream({ resource_type: 'image' }, async (error, result) => {
    if (error) {
      return res.status(500).json({ error: 'Error uploading image to Cloudinary' });
    }


    // If successful, save the Cloudinary URL to MongoDB
    const newImage = new Image({ imageUrl: result.url });
    await newImage.save();


    // Respond with the Cloudinary URL
    res.json({ imageUrl: result.url });
  }).end(req.file.buffer);
});


const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});