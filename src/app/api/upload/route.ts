import { NextRequest, NextResponse } from "next/server";
import { Client } from "minio";
import { nanoid } from "nanoid";

const minioClient = new Client({
  endPoint: process.env.NEXT_PUBLIC_R2_ENDPOINT!.replace("https://", ""),
  accessKey: process.env.NEXT_PUBLIC_R2_ACCESS_KEY!,
  secretKey: process.env.NEXT_PUBLIC_R2_SECRET_KEY!,
  region: "auto",
  useSSL: true,
});

export async function POST(req: NextRequest) {
  const { base64, contentType = "image/png" } = await req.json();

  if (!base64) {
    return NextResponse.json({ error: "No image provided" }, { status: 400 });
  }

  const matches = base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return NextResponse.json(
      { error: "Invalid base64 image" },
      { status: 400 }
    );
  }

  try {
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    const filename = `${nanoid()}.${contentType.split("/")[1]}`;
    const bucketName = process.env.NEXT_PUBLIC_R2_BUCKET_NAME!;

    await minioClient.putObject(bucketName, filename, buffer, buffer.length, {
      "Content-Type": contentType,
    });

    const endpoint = process.env.NEXT_PUBLIC_R2_ENDPOINT!.startsWith("https://")
      ? process.env.NEXT_PUBLIC_R2_ENDPOINT
      : `https://${process.env.NEXT_PUBLIC_R2_ENDPOINT}`;

    const publicUrl = process.env.NEXT_PUBLIC_R2_PUBLIC_URL
      ? `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${filename}`
      : `${endpoint}/${bucketName}/${filename}`;

    return NextResponse.json({ success: true, url: publicUrl, filename });
  } catch (err: any) {
    console.error("Upload error", err);
    return NextResponse.json({ error: "Failed to upload" }, { status: 500 });
  }
}
