import dotenv from "dotenv";

dotenv.config();

const PAYFORT_CONFIG = {
  merchant_identifier: process.env.MERCHANT_IDENTIFIER,
  access_code: process.env.ACCESS_CODE,
  sha_request_phrase: process.env.SHA_REQUEST_PHRASE,
  sha_response_phrase: process.env.SHA_RESPONSE_PHRASE,
  sandbox_mode: true,
};

export default PAYFORT_CONFIG;
