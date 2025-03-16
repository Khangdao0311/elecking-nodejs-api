var jwt = require("jsonwebtoken");

module.exports = {
  authentication,
  authorization,
};

async function authentication(req, res, next) {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];

      if (!token) return res.status(401).json({ status: 401, message: "Token Not Verified" });

      const decoded = jwt.decode(token);

      if (!decoded || !decoded.exp) return res.status(401).json({ status: 401, message: "Invalid Token" })

      const expirationTime = decoded.exp * 1000;
      const currentTime = Date.now();

      if (currentTime > expirationTime) return res.status(401).json({ status: 401, message: "Token Expired" });

      jwt.verify(token, process.env.JWTSECRET, (error, data) => {
        if (error) {
          return res.status(403).json({ status: 403, message: "Forbidden" });
        }
        req.user = data.user;
        next();
      });
    } else {
      return res.status(401).json({ status: 401, message: "Token Not Verified" });
    }
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
}

async function authorization(req, res, next) {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];

      if (!token) return res.status(401).json({ status: 401, message: "Token Not Verified" });

      const decoded = jwt.decode(token);

      if (!decoded || !decoded.exp) return res.status(401).json({ status: 401, message: "Invalid Token" })

      const expirationTime = decoded.exp * 1000;
      const currentTime = Date.now();

      if (currentTime > expirationTime) return res.status(401).json({ status: 401, message: "Token Expired" });

      jwt.verify(token, process.env.JWTSECRET, (error, data) => {
        if (error || !data.user.role) {
          return res.status(403).json({ status: 403, message: "Forbidden" });
        }
        req.user = data.user;
        next();
      });
    } else {
      return res.status(401).json({ status: 401, message: "Token Not Verified" });
    }
  } catch (error) {
    return res.status(500).json({ status: 500, message: "Internal Server Error" });
  }
}
