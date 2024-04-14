import mongoose from "mongoose";

type ConnectionObject = {
  isConnected?: number;
}

const connectionObj: ConnectionObject = {}

export async function dbConnect (): Promise<void> {

  if(connectionObj.isConnected) {
    console.log("DB Already Connected")
    return
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI || "")
    console.log("db", db)

    connectionObj.isConnected = db.connections[0].readyState

    console.log("DB Connected")
  } catch (error) {
    console.log("DB Connection Failed", error)
    process.exit(1)
  }
}