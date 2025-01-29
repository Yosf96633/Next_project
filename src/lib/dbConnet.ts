import mongoose from "mongoose";
type ConnectionObject = {
  isConnected?: number;
};
const connection: ConnectionObject = {};
async function dbConnet(): Promise<void> {
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI || "", {});
    connection.isConnected = db.connections[0].readyState;
    console.log(`Database connented successfully`);
  } catch (error) {
    console.log(`Error while connecting database`, error);
    process.exit(1);
  }
}
export default dbConnet;
