import crypto from "crypto";
// Generate SHA-256 signature
export const generateSignature = (params, phrase) => {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      if (params[key]) {
        acc[key] = params[key];
      }
      return acc;
    }, {});

  let signString = "";
  for (let key in sortedParams) {
    signString += `${key}=${sortedParams[key]}`;
  }

  return crypto
    .createHash("sha256")
    .update(phrase + signString + phrase)
    .digest("hex");
};
