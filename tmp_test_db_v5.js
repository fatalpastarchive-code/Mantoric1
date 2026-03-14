const { MongoClient } = require('mongodb');

async function test() {
  const uri = "mongodb://huseynky02_db_user:Ey7X8XQI34Q6DA1U@ac-rwkrn2p-shard-00-00.4c9ia8c.mongodb.net:27017/test?authSource=admin&directConnection=true&ssl=true";
  const client = new MongoClient(uri);

  try {
    console.log("Connecting (Direct Host URI)...");
    await client.connect();
    console.log("Connected successfully to Atlas node! 🚀");
    const admin = client.db('admin');
    const hello = await admin.command({ hello: 1 });
    console.log("Replica Set Info:", hello.setName);
    await client.close();
  } catch (e) {
    console.error("Connection failed again with direct host string:", e);
  }
}

test();
