const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const { MongoClient } = require('mongodb');

async function test() {
  const uri = "mongodb+srv://huseynky02_db_user:Ey7X8XQI34Q6DA1U@db.4c9ia8c.mongodb.net/";
  const client = new MongoClient(uri);

  try {
    console.log("Connecting (IPv4 enforced)...");
    await client.connect();
    console.log("Connected successfully!");
    await client.close();
  } catch (e) {
    console.error("Connection failed:", e);
  }
}

test();
