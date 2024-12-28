export const payfortConfig = {
  merchantIdentifier: process.env.PAYFORT_MERCHANT_IDENTIFIER || "ojpNUAef",
  accessCode: process.env.PAYFORT_ACCESS_CODE || "P26QiOOuzZbuoCyBpWB",
  shaType: "SHA-256",
  shaRequestPhrase:
    process.env.PAYFORT_SHA_REQUEST_PHRASE || "S1JsKABL/qbpTz91tgla/I",
  shaResponsePhrase:
    process.env.PAYFORT_SHA_RESPONSE_PHRASE || "81/GgkGN80tYth.HwDHtVl#",
  sandboxMode: process.env.NODE_ENV !== "production",
  language: "en",
  currency: "SAR",
};
