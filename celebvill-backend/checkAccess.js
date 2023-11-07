const config = require("./config");

module.exports = () => {
  return (req, res, next) => {
    const token = req.headers.key || req.body.key || req.query.key;
    if (token) {
      if (token == config.SECRET_KEY ) { //config.SECRET_KEY 
        next();
      } else {
        return res
          .status(401)
          .json({ status: false, error: "Unauthorized Access :",token });
      }
    } else {
      return res
        .status(401)
        .json({ status: false, error: "Unauthorized Access 2 :",token  });
    }
  };
};
