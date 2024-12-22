/**
 * @swagger
 * components:
 *   schemas:
 *     BarcodeType:
 *       type: object
 *       required:
 *         - type
 *       properties:
 *         id:
 *           type: string
 *           format: cuid
 *           description: Auto-generated unique identifier
 *         type:
 *           type: string
 *           enum: [GTIN, GLN, SSCC, SEC, UDI, SFDA, SASO, OTA]
 *           description: Type of barcode
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 */

/**
 * @swagger
 * /api/v1/barcode-types:
 *   post:
 *     summary: Create a new barcode type
 *     tags: [BarcodeTypes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [GTIN, GLN, SSCC, SEC, UDI, SFDA, SASO, OTA]
 *     responses:
 *       201:
 *         description: Barcode type created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 201
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Barcode type created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     barcodeType:
 *                       $ref: '#/components/schemas/BarcodeType'
 *       400:
 *         description: Invalid input or barcode type already exists
 *
 *   get:
 *     summary: Get all barcode types
 *     tags: [BarcodeTypes]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [GTIN, GLN, SSCC, SEC, UDI, SFDA, SASO, OTA]
 *         description: Filter by barcode type
 *     responses:
 *       200:
 *         description: List of barcode types retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Barcode types retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     barcodeTypes:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/BarcodeType'
 */

/**
 * @swagger
 * /api/v1/barcode-types/{id}:
 *   get:
 *     summary: Get a barcode type by ID
 *     tags: [BarcodeTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Barcode type ID
 *     responses:
 *       200:
 *         description: Barcode type retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Barcode type retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     barcodeType:
 *                       $ref: '#/components/schemas/BarcodeType'
 *       404:
 *         description: Barcode type not found
 *
 *   put:
 *     summary: Update a barcode type
 *     tags: [BarcodeTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Barcode type ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [GTIN, GLN, SSCC, SEC, UDI, SFDA, SASO, OTA]
 *     responses:
 *       200:
 *         description: Barcode type updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Barcode type updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     barcodeType:
 *                       $ref: '#/components/schemas/BarcodeType'
 *       400:
 *         description: Invalid input or duplicate type
 *       404:
 *         description: Barcode type not found
 *
 *   delete:
 *     summary: Delete a barcode type
 *     tags: [BarcodeTypes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Barcode type ID
 *     responses:
 *       200:
 *         description: Barcode type deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Barcode type deleted successfully
 *                 data:
 *                   type: null
 *       404:
 *         description: Barcode type not found
 */
