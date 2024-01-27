const cloudinary = require('cloudinary');
const router = require('express').Router();
require('dotenv').config();

cloudinary.config({ 
  cloud_name: 'easeshop', 
  api_key: '919767831792455', 
  api_secret: '***************************' 
});

router.delete('/:public_id', async (req, res) => {
    const { public_id } = req.params;
  
    try {
      // Destroy the image using Cloudinary
      await cloudinary.uploader.destroy(public_id);
  
      res.status(200).send();
    } catch (error) {
      res.status(400).send(error.message);
    }
  });

  module.exports=router;