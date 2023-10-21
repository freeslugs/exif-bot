
import piexif from 'piexifjs';
import fs from 'fs';

import fetch from 'node-fetch';

import TelegramBot from 'node-telegram-bot-api';
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {polling: true});
const getBase64DataFromJpegFile = filename => fs.readFileSync(filename).toString('binary');
const getExifFromJpegFile = filename => piexif.load(getBase64DataFromJpegFile(filename));

function debugExif(exif) {
  for (const ifd in exif) {
      if (ifd == 'thumbnail') {
          const thumbnailData = exif[ifd] === null ? "null" : exif[ifd];
          console.log(`- thumbnail: ${thumbnailData}`);
      } else {
          console.log(`- ${ifd}`);
          for (const tag in exif[ifd]) {
              console.log(`    - ${piexif.TAGS[ifd][tag]['name']}: ${exif[ifd][tag]}`);
          }
      }
  }
}

// Listen for new incoming messages
bot.on('message', async (msg) => {
  // Handle the incoming message
  
  if(msg.photo) {
    bot.sendMessage(msg.chat.id, 'please attach as file to preserve exif data');
    // bot.sendChatAction(msg.chat.id,  "find_location")
  }

  if (msg.document) {
    const fileId = msg.document.file_id;
    const fileUrl = `https://api.telegram.org/bot${bot.token}/getFile?file_id=${fileId}`;

    try {
      const response = await fetch(fileUrl);
      const data = await response.json();
      const filePath = data.result.file_path;
      
      console.log(`filePath: ${filePath}`);

      const imageResponse = await fetch(`https://api.telegram.org/file/bot${bot.token}/${filePath}`);
      const imageBuffer = await imageResponse.buffer();
      // console.log(imageBuffer)

      // console.log(typeof imageBuffer);

      // const base64data = imageBuffer.toString('binary');
      // const exifData = piexif.load(base64data)

      // console.log(exifData)
      
      // fs.writeFile('image.jpg', imageBuffer, (err) => {
      //   if (err) {
      //     console.error('Error downloading image:', err);
      //   } 
        
        const exif = piexif.load(imageBuffer.toString('binary'))
        // const exif = getExifFromJpegFile("image.jpg");
        
        const latitude = exif['GPS'][piexif.GPSIFD.GPSLatitude];
        const latitudeRef = exif['GPS'][piexif.GPSIFD.GPSLatitudeRef];
        const longitude = exif['GPS'][piexif.GPSIFD.GPSLongitude];
        const longitudeRef = exif['GPS'][piexif.GPSIFD.GPSLongitudeRef];

        if(latitude && longitude) {
          console.log(`${latitude} ${latitudeRef}`, `${longitude} ${longitudeRef}`)
          bot.sendLocation(msg.chat.id, `${latitude} ${latitudeRef}`, `${longitude} ${longitudeRef}`)
        }
      // });
    } catch (error) {
      console.error(error);
    }

    // console.log(`fileUrl: ${fileUrl}`)

    // https://api.telegram.org/bot<bot_token>/getFile?file_id=the_file_id
  }
  
  
});

console.log('Server has started.');  // Log that server has started




// console.log(debugExif(exif))

// const lat = palm1Exif.GPS[0] + palm1Exif.GPSLatitude[1]/60 + palm1Exif.GPSLatitude[2]/3600;
// const lng = palm1Exif.GPSLongitude[0] + palm1Exif.GPSLongitude[1]/60 + palm1Exif.GPSLongitude[2]/3600;
// console.log(`lat: ${lat}, lng: ${lng}`)

// Show the latitudes and longitudes where the palm tree photos were taken 

  // console.log("---------------------");
  // console.log(`Latitude: ${latitude} ${latitudeRef}`);
  // console.log(`Longitude: ${longitude} ${longitudeRef}\n`);




// function debugExif(exif) {
//   for (const ifd in exif) {
//       if (ifd == 'thumbnail') {
//           const thumbnailData = exif[ifd] === null ? "null" : exif[ifd];
//           console.log(`- thumbnail: ${thumbnailData}`);
//       } else {
//           console.log(`- ${ifd}`);
//           for (const tag in exif[ifd]) {
//               console.log(`    - ${piexif.TAGS[ifd][tag]['name']}: ${exif[ifd][tag]}`);
//           }
//       }
//   }
// }


// const imageExif = getExifFromJpegFile("image.jpg");
// console.log(imageExif)
