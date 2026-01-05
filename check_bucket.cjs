
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env
function parseEnv() {
    try {
        const envPath = path.resolve(__dirname, '.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const config = {};
        envContent.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["']|["']$/g, '');
                config[key] = value;
            }
        });
        return config;
    } catch (e) {
        console.error("Error reading .env:", e.message);
        return {};
    }
}

const envConfig = parseEnv();

if (!envConfig.VITE_SUPABASE_URL || !envConfig.VITE_SUPABASE_ANON_KEY) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(envConfig.VITE_SUPABASE_URL, envConfig.VITE_SUPABASE_ANON_KEY);

async function checkBucket() {
    console.log("Checking buckets...");
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
        console.error("Error listing buckets:", error);
        return;
    }

    const avatarsBucket = data.find(b => b.name === 'avatars');
    if (avatarsBucket) {
        console.log("✅ 'avatars' bucket exists.");
        console.log("Public:", avatarsBucket.public);
    } else {
        console.error("❌ 'avatars' bucket NOT found.");
        console.log("Available buckets:", data.map(b => b.name).join(', '));
    }
}

checkBucket();
