import React, { useState } from "react";

const Cloudinary = () => {
  const [images, setImages] = useState([]);

  const addImages = e => {
    const arr = [];
    for (let i = 0; i < e.target.files.length; i++) {
      arr.push(e.target.files[i]);
    }
    setImages(arr);
    console.log("e.target.files", arr);
  };

  const uploadImages = async e => {
    e.preventDefault();
    console.log("images", images);
    images.forEach(async img => {
      const data = new FormData();
      data.append("file", img);
      data.append("upload_preset", "post-imgs");
      const response = await fetch("https://api.cloudinary.com/v1_1/ztf/upload", {
        method: "POST",
        body: data
      });
      const resData = await response.json();
      console.log(resData);
    });
  };

  return (
    <div>
      <form onSubmit={uploadImages}>
        <input type="file" multiple accept="image/*" onChange={addImages} />
        <button>submit</button>
      </form>
    </div>
  );
};

export default Cloudinary;
