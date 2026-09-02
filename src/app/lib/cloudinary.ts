import { v2 as cloudinary } from "cloudinary";
import envConfig from "../config/envConfig";

cloudinary.config({
  cloud_name: envConfig.CLOUDINARY_CLOUD_NAME as string,
  api_key: envConfig.CLOUDINARY_API_KEY as string,
  api_secret: envConfig.CLOUDINARY_API_SECRET as string,
});

export default cloudinary;
