import { connect } from 'mongoose'
import { config } from 'dotenv'
config({
    path:"../config/.env"
})

const databaseConnection = async ()=>{
    try {
        await connect(process.env.MONGO_URI)
        console.log("database connected successfully");
        
        
    } catch (error) {
        console.log("database connection failed",error)
    }
}
export default databaseConnection;