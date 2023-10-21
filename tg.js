
import exifr from 'exifr' 

import fetch from 'node-fetch';

import TelegramBot from 'node-telegram-bot-api';
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {polling: true});

// Listen for new incoming messages
bot.on('message', async (msg) => {
  // Handle the incoming message
  if(msg.text) {
    console.log('hello world')
    console.log(msg.text)
  }

  if(msg.photo) {
    bot.sendMessage(msg.chat.id, 'please attach as file to preserve exif data');
    // bot.sendChatAction(msg.chat.id,  "find_location")
  }

  if (msg.document) {
    const fileId = msg.document.file_id;

    const fileUrl = `https://api.telegram.org/bot${bot.token}/getFile?file_id=${fileId}`;
    const response = await fetch(fileUrl);
    const data = await response.json();
    console.log(data)
    const filePath = data.result.file_path;
    const fileType = filePath.split('.').pop().toLowerCase();
    
    if (fileType === 'jpg' || fileType === 'jpeg' || fileType === 'png' || fileType === 'heic') {
      console.log('photo');

      const imageResponse = await fetch(`https://api.telegram.org/file/bot${bot.token}/${filePath}`);
      const imageBuffer = await imageResponse.buffer();
      
      const exif = await exifr.parse(imageBuffer)
      
      const createdAt = new Date(exif.DateTimeOriginal).toLocaleString();
      const updatedAt = new Date(exif.ModifyDate).toLocaleString();
      
      if(createdAt && updatedAt) {
        let dateTimeMsg = `Created on ${createdAt}. `
        if(createdAt != updatedAt) {
          dateTimeMsg += `Updated on ${updatedAt}`
        }
        bot.sendMessage(msg.chat.id, dateTimeMsg);
      }
      
      const latitude = `${exif.latitude} ${exif.GPSLongitudeRef}`
      const longitude = `${exif.longitude} ${exif.GPSLongitudeRef}`
      
      if(latitude && longitude) {
        console.log(latitude, longitude)
        bot.sendLocation(msg.chat.id, latitude, longitude)
      }
    
    } else if (fileType === 'mp4' || fileType === 'avi' || fileType === 'mov') {
      console.log('video');
    } else {
      console.log('unknown');
    }
  }
});

console.log('Server has started.');