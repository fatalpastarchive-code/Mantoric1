const { MongoClient } = require('mongodb');

const variations = [
  {
    name: "Direct Shard with lioncode",
    uri: "mongodb://huseynky02_db_user:lioncode@ac-rwkrn2p-shard-00-00.4c9ia8c.mongodb.net:27017/ganghub?authSource=admin&directConnection=true&ssl=true"
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
