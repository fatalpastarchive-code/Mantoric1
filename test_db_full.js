const { MongoClient } = require('mongodb');

async function test() {
  const uri = "mongodb://huseynky02_db_user:lioncode@ac-rwkrn2p-shard-00-00.4c9ia8c.mongodb.net:27017,ac-rwkrn2p-shard-00-01.4c9ia8c.mongodb.net:27017,ac-rwkrn2p-shard-00-02.4c9ia8c.mongodb.net:27017/ganghub?ssl=true&authSource=admin&replicaSet=atlas-rwkrn2p-shard-0";
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });

  try {
    console.log("Connecting to full replica set...");
    await client.connect();
    console.log("✅ SUCCESS: Full Replica Set Connected!");
    await client.close();
  } catch (e) {
    console.error("❌ FAILED:", e.message);
  }
}

test();
