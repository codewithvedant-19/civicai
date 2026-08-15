import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { supabaseServer } from "./lib/supabase";

async function setupBucket() {
  const bucketName = "road-reports";
  
  console.log(`Checking if bucket '${bucketName}' exists...`);
  const { data: buckets, error: listError } = await supabaseServer.storage.listBuckets();
  
  if (listError) {
    console.error("Error listing buckets:", listError);
    return;
  }
  
  const exists = buckets.some(b => b.name === bucketName);
  
  if (!exists) {
    console.log(`Bucket '${bucketName}' not found. Creating it...`);
    const { error: createError } = await supabaseServer.storage.createBucket(bucketName, {
      public: true,
      fileSizeLimit: 10485760, // 10MB
    });
    
    if (createError) {
      console.error("Error creating bucket:", createError);
    } else {
      console.log(`✅ Bucket '${bucketName}' created successfully.`);
    }
  } else {
    console.log(`✅ Bucket '${bucketName}' already exists. Updating to public just in case...`);
    await supabaseServer.storage.updateBucket(bucketName, {
      public: true,
    });
  }
}

setupBucket();
