const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: "ztf",
  api_key: "564174154855135",
  api_secret: "Ac5MrwJ0KmlIp7jw8EW5iR3nPdg"
});

module.exports = public_id => {
  cloudinary.api.delete_resources([public_id], function(error, result) {
    console.log(result);
  });
};
