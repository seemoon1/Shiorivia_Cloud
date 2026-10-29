import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  return NextResponse.json({ error: "Legacy server-file storage is disabled in Shiorivia Cloud." }, { status: 410 });
  try {
    const { base64 } = await req.json();
    
    const uploadDir = path.join(process.cwd(), 'public', 'gallery');
    
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    const fileName = `gen_${Date.now()}_${uuidv4().slice(0, 8)}.png`;
    const filePath = path.join(uploadDir, fileName);
    
    fs.writeFileSync(filePath, buffer);

    console.log(`💾 Image saved locally: ${fileName}`);

    const publicUrl = `/gallery/${fileName}`;

    return NextResponse.json({ url: publicUrl });

  } catch (error: any) {
    console.error("Local Save Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}