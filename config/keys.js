
var db={
    mongoDB:process.env.MONGO_DB || process.env.MONGODB,
    secret:process.env.SECRET || process.env.CAPTSECRET
}
module.exports=db