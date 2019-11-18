module.exports = {
  mongoURI: `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-zygzu.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true`,
  secretOrKey: process.env.SECRET_OR_KEY
};
