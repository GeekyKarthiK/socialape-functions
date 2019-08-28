const { admin } = require("./admin");
const { db } = require("../utils/admin");

exports.FBAuth = (req, res, next) => {
  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    idToken = req.headers.authorization.split("Bearer ")[1];
  } else {
    console.error("No token found");
    return res.status(403).json({ error: "Unauthorized" });
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then(decodedToken => {
      req.user = decodedToken;
      return db
        .collection("users")
        .where("userId", "==", req.user.uid)
        .limit(1)
        .get();
    })
    .then(data => {
      console.error(data.docs, "DATA");
      req.user.handle = data.docs[0].data().handle;
      return next();
    })
    .catch(err => {
      console.error("error while verifying token ", err);
      return res.status(403).json(err);
    });
};
