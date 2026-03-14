const { MongoClient } = require('mongodb');

const variations = [
  {
    name: "Original .env.local (SRV)",
    uri: "mongodb+srv://huseynky02_db_user:lioncode@db.4c9ia8c.mongodb.net/ganghub?retryWrites=true&w=majority&appName=DB"
  },
  {
    name: "Test v5 Password (SRV)",
    uri: "mongodb+srv://huseynky02_db_user:Ey7X8XQI34Q6DA1U@db.4c9ia8c.mongodb.net/ganghub?retryWrites=true&w=majority&appName=DB"
  },
  {
    name: "Direct Shard (No SRV)",
    uri: "mongodb://huseynky02_db_user:Ey7X8XQI34Q6DA1U@ac-rwkrn2p-shard-00-00.4c9ia8c.mongodb.net:27017/ganghub?authSource=admin&directConnection=true&ssl=true"
  }
];

async function runTests() {
  for (const v of variations) {
    console.log(`Testing: ${v.name}...`);
    const client = new MongoClient(v.uri, { serverSelectionTimeoutMS: 5000 });
    try {
      await client.connect();
      console.log(`✅ SUCCESS: ${v.name}`);
      await client.close();
    } catch (e) {
      console.log(`❌ FAILED: ${v.name} - ${e.message}`);
    }
    console.log('---');
  }
}

runTests();
