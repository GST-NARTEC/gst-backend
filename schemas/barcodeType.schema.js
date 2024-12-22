import Joi from "joi";

// enum BarcodeTypes{
//     GTIN
//     GLN
//     SSCC
//     SEC
//     UDI
//     SFDA
//     SASO
//     OTA
// }

export const barcodeTypes = [
  "GTIN",
  "GLN",
  "SSCC",
  "SEC",
  "UDI",
  "SFDA",
  "SASO",
  "OTA",
];

export const barcodeTypeSchema = Joi.object({
  type: Joi.string()
    .valid(...barcodeTypes)
    .required(),
});

export const barcodeTypeQuerySchema = Joi.object({
  type: Joi.string()
    .valid(...barcodeTypes)
    .optional(),
});
