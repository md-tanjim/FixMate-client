
import { NextRequest, NextResponse } from "next/server";

// Run this endpoint on the Node.js runtime.
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // ----------------------------------------------
    // 1. Get environment variables
    // ----------------------------------------------

    const apiKey = process.env.NEXT_PUBLIC_IMG_BB_API_KEY;
    const uploadUrl = process.env.IMG_BB_URL;

    if (!apiKey || !uploadUrl) {
      console.error("ImgBB environment variables are missing.");

      return NextResponse.json(
        { message: "Image upload configuration is missing." },
        { status: 500 }
      );
    }

    // ----------------------------------------------
    // 2. Read the uploaded file
    // ----------------------------------------------

    const formData = await request.formData();

    const image = formData.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json(
        { message: "Please select an image." },
        { status: 400 }
      );
    }

    // ----------------------------------------------
    // 3. Validate image type
    // ----------------------------------------------

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (!allowedTypes.includes(image.type)) {
      return NextResponse.json(
        {
          message:
            "Only JPG, PNG, WEBP and GIF images are allowed.",
        },
        { status: 400 }
      );
    }

    // ----------------------------------------------
    // 4. Validate image size
    // ----------------------------------------------

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

    if (image.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: "Image size must be less than 5 MB." },
        { status: 400 }
      );
    }

    // ----------------------------------------------
    // 5. Prepare ImgBB request
    // ----------------------------------------------

    const imgbbFormData = new FormData();

    imgbbFormData.append("image", image, image.name);

    const endpoint = new URL(uploadUrl);

    endpoint.searchParams.set("key", apiKey);

    // ----------------------------------------------
    // 6. Upload to ImgBB
    // ----------------------------------------------

    const response = await fetch(endpoint.toString(), {
      method: "POST",
      body: imgbbFormData,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      console.error("ImgBB upload failed:", result);

      return NextResponse.json(
        { message: "Unable to upload image." },
        { status: 502 }
      );
    }

    // ----------------------------------------------
    // 7. Return the direct image URL
    // ----------------------------------------------

    return NextResponse.json({
      success: true,
      imageUrl: result.data.url,
    });

  } catch (error) {
    console.error("Profile image upload error:", error);

    return NextResponse.json(
      { message: "Something went wrong during image upload." },
      { status: 500 }
    );
  }
}
