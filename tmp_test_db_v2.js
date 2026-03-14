const { MongoClient } = require('mongodb');

async function test() {
  const uri = "mongodb://huseynky02_db_user:Ey7X8XQI34Q6DA1U@ac-rwkrn2p-shard-00-00.4c9ia8c.mongodb.net:27017,ac-rwkrn2p-shard-00-01.4c9ia8c.mongodb.net:27017,ac-rwkrn2p-shard-00-02.4c9ia8c.mongodb.net:27017/?ssl=true&authSource=admin&replicaSet=atlas-rwkrn2p-shard-0";
  const client = new MongoClient(uri);

  try {
    console.log("Connecting (Standard URI)...");
    await client.connect();
    console.log("Connected successfully!");
    await client.close();
  } catch (e) {
    console.error("Connection failed again:", e);
  }
}

test();
