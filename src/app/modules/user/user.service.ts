import type { UploadApiResponse } from "cloudinary";
import cloudinary from "../../lib/cloudinary";
import { prisma } from "../../lib/prisma";
import { format } from "date-fns";

const updateUserProfilePhoto = async (buffer: Buffer, userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  const timestamp = format(new Date(), "yyyyMMddHHmmssSSS");

  const cloudinaryResponse = await new Promise<UploadApiResponse>(
    (resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            folder: "healthcare/users/profile",
            public_id: `profile_${timestamp}`,
            overwrite: true,
          },
          (error, result) => {
            if (error) {
              return reject(error);
            }

            if (!result) {
              return reject(new Error("No result returned from Cloudinary"));
            }

            resolve(result);
          },
        )
        .end(buffer);
    },
  );

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      profilePhotoUrl: cloudinaryResponse.secure_url,
      profilePhotoPublicId: cloudinaryResponse.public_id,
    },
  });

  if (user?.profilePhotoPublicId && user?.profilePhotoUrl) {
    await cloudinary.uploader.destroy(user?.profilePhotoPublicId);
  }

  return updatedUser;
};

export const UserService = {
  updateUserProfilePhoto,
};
